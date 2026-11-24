import { Address } from '../types';
import { StorageService, StorageKeys } from './storage.service';
import { supabase, isSupabaseConfigured } from './supabase';

const DEFAULT_INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr-default-1',
    recipient_name: 'Jane Doe',
    phone_number: '+234 801 234 5678',
    street_address: '14 Victoria Island Boulevard',
    city: 'Lagos',
    state: 'Lagos State',
    country: 'Nigeria',
    is_default: true,
  },
];

export const AddressService = {
  /**
   * Get all saved delivery addresses for the customer
   */
  async getAddresses(customerId?: string): Promise<Address[]> {
    // 1. Try Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('addresses').select('*').order('is_default', { ascending: false });
        if (customerId) {
          query = query.eq('customer_id', customerId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped: Address[] = data.map((d: any) => ({
            id: String(d.id),
            customer_id: d.customer_id,
            recipient_name: d.recipient_name,
            phone_number: d.phone_number,
            street_address: d.street_address || d.address_line1,
            city: d.city,
            state: d.state,
            country: d.country || 'Nigeria',
            is_default: Boolean(d.is_default),
          }));
          await StorageService.setItem(StorageKeys.ADDRESSES, mapped);
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase get addresses error, falling back to local storage:', e);
      }
    }

    // 2. Fallback to AsyncStorage
    const saved = await StorageService.getItem<Address[]>(StorageKeys.ADDRESSES, []);
    if (!saved || saved.length === 0) {
      await StorageService.setItem(StorageKeys.ADDRESSES, DEFAULT_INITIAL_ADDRESSES);
      return DEFAULT_INITIAL_ADDRESSES;
    }
    return saved;
  },

  /**
   * Add a new delivery address
   */
  async addAddress(newAddress: Omit<Address, 'id'>, customerId?: string): Promise<Address> {
    const address: Address = {
      ...newAddress,
      customer_id: newAddress.customer_id || customerId,
      id: 'addr-' + Date.now().toString(36),
    };

    // 1. If set as default, mark existing addresses as non-default
    let current = await this.getAddresses(address.customer_id);
    if (address.is_default) {
      current = current.map((a) => ({ ...a, is_default: false }));
    }

    // 2. Try Supabase insert
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('addresses')
          .insert([
            {
              customer_id: address.customer_id,
              recipient_name: address.recipient_name,
              phone_number: address.phone_number,
              street_address: address.street_address,
              city: address.city,
              state: address.state,
              country: address.country || 'Nigeria',
              is_default: address.is_default,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          address.id = String(data.id);
        }
      } catch (e) {
        console.warn('Supabase add address error:', e);
      }
    }

    const updated = [address, ...current];
    await StorageService.setItem(StorageKeys.ADDRESSES, updated);
    return address;
  },

  /**
   * Update an existing address
   */
  async updateAddress(id: string, updates: Partial<Address>): Promise<Address> {
    const current = await this.getAddresses();
    let updatedList = current.map((a) => {
      if (a.id === id) {
        return { ...a, ...updates };
      }
      if (updates.is_default) {
        return { ...a, is_default: false };
      }
      return a;
    });

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('addresses')
          .update({
            recipient_name: updates.recipient_name,
            phone_number: updates.phone_number,
            street_address: updates.street_address,
            city: updates.city,
            state: updates.state,
            is_default: updates.is_default,
          })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase update address error:', e);
      }
    }

    await StorageService.setItem(StorageKeys.ADDRESSES, updatedList);
    const target = updatedList.find((a) => a.id === id);
    if (!target) throw new Error('Address not found');
    return target;
  },

  /**
   * Delete an address
   */
  async deleteAddress(id: string, customerId?: string): Promise<boolean> {
    const current = await this.getAddresses(customerId);
    const filtered = current.filter((a) => a.id !== id);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('addresses').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete address error:', e);
      }
    }

    await StorageService.setItem(StorageKeys.ADDRESSES, filtered);
    return true;
  },

  /**
   * Set an address as the default address
   */
  async setDefault(id: string, customerId?: string): Promise<void> {
    await this.updateAddress(id, { is_default: true });
  },
};
