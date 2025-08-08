import { supabase } from '../config/supabaseConfig';

class SupabaseSellerService {
  
  // Get seller profile and settings
  async getSellerSettings(walletAddress) {
    try {
      console.log(`🔄 Fetching seller settings for wallet: ${walletAddress}`);

      // Fetch profile and settings in parallel
      const [profileResult, settingsResult] = await Promise.all([
        supabase
          .from('seller_profiles')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single(),
        supabase
          .from('seller_settings')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single()
      ]);

      // Handle profile data
      let profile = {};
      let profileExists = false;
      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        console.error('Supabase profile fetch error:', profileResult.error);
        throw new Error(`Profile fetch failed: ${profileResult.error.message}`);
      } else if (profileResult.data) {
        profile = profileResult.data;
        profileExists = true;
        console.log('✅ Seller profile fetched:', profile);
      }

      // Handle settings data  
      let settings = {};
      let settingsExists = false;
      if (settingsResult.error && settingsResult.error.code !== 'PGRST116') {
        console.error('Supabase settings fetch error:', settingsResult.error);
        throw new Error(`Settings fetch failed: ${settingsResult.error.message}`);
      } else if (settingsResult.data) {
        settings = settingsResult.data;
        settingsExists = true;
        console.log('✅ Seller settings fetched:', settings);
      }

      return {
        profile,
        settings,
        exists: { profile: profileExists, settings: settingsExists }
      };

    } catch (error) {
      console.error('❌ Failed to get seller settings:', error);
      throw error;
    }
  }

  // Update seller profile
  async updateSellerProfile(walletAddress, profileData) {
    try {
      console.log(`💾 Updating seller profile for wallet: ${walletAddress}`);

      const { data, error } = await supabase
        .from('seller_profiles')
        .upsert({
          wallet_address: walletAddress,
          business_name: profileData.business_name,
          business_email: profileData.business_email,
          business_address: profileData.business_address,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'wallet_address'
        })
        .select('*')
        .single();

      if (error) {
        console.error('Supabase seller profile update error:', error);
        throw new Error(`Failed to update seller profile: ${error.message}`);
      }

      console.log('✅ Seller profile updated successfully:', data);
      return data;

    } catch (error) {
      console.error('❌ Failed to update seller profile:', error);
      throw error;
    }
  }

  // Update seller settings
  async updateSellerSettings(walletAddress, settingsData) {
    try {
      console.log(`💾 Updating seller settings for wallet: ${walletAddress}`);

      const { data, error } = await supabase
        .from('seller_settings')
        .upsert({
          wallet_address: walletAddress,
          default_warranty_period: parseInt(settingsData.default_warranty_period),
          default_warranty_price: parseFloat(settingsData.default_warranty_price),
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'wallet_address'
        })
        .select('*')
        .single();

      if (error) {
        console.error('Supabase seller settings update error:', error);
        throw new Error(`Failed to update seller settings: ${error.message}`);
      }

      console.log('✅ Seller settings updated successfully:', data);
      return data;

    } catch (error) {
      console.error('❌ Failed to update seller settings:', error);
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('count', { count: 'exact' });
      
      if (error) throw error;
      console.log('✅ Seller service connection successful');
      return true;
    } catch (error) {
      console.error('❌ Seller service connection failed:', error);
      throw error;
    }
  }
}

export const supabaseSellerService = new SupabaseSellerService();