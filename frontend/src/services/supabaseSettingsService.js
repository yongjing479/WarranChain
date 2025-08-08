import { supabase } from '../config/supabaseConfig';

class SupabaseSettingsService {
  /**
   * Get user profile and settings
   */
  async getUserSettings(walletAddress) {
    try {
      console.log(`🔍 Fetching settings for wallet: ${walletAddress}`);

      // Get profile and settings in parallel
      const [profileResult, settingsResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single(),
        
        supabase
          .from('user_settings')
          .select('*')
          .eq('wallet_address', walletAddress)
          .single()
      ]);

      console.log('📊 Profile result:', profileResult);
      console.log('⚙️ Settings result:', settingsResult);

      return {
        profile: profileResult.data || {
          full_name: '',
          email: '',
          wallet_address: walletAddress
        },
        settings: settingsResult.data || {
          warranty_expiry_notification: '7 days before',
          repair_reminder_frequency: 'Monthly',
          ewaste_prevention_goal: 100,
          co2_reduction_goal: 2.0,
          local_business_support_goal: 5
        },
        exists: {
          profile: !profileResult.error,
          settings: !settingsResult.error
        }
      };

    } catch (error) {
      console.error('❌ Failed to fetch user settings:', error);
      
      // Return default values on error
      return {
        profile: {
          full_name: '',
          email: '',
          wallet_address: walletAddress
        },
        settings: {
          warranty_expiry_notification: '7 days before',
          repair_reminder_frequency: 'Monthly',
          ewaste_prevention_goal: 100,
          co2_reduction_goal: 2.0,
          local_business_support_goal: 5
        },
        exists: { profile: false, settings: false }
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(walletAddress, profileData) {
    try {
      console.log(`📝 Updating profile for wallet: ${walletAddress}`, profileData);

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          wallet_address: walletAddress,
          full_name: profileData.fullName || profileData.full_name,
          email: profileData.email,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'wallet_address'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase profile update error:', error);
        throw error;
      }

      console.log('✅ Profile updated successfully:', data);
      return data;

    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(walletAddress, settingsData) {
    try {
      console.log(`⚙️ Updating settings for wallet: ${walletAddress}`, settingsData);

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          wallet_address: walletAddress,
          warranty_expiry_notification: settingsData.warrantyExpiryNotification || settingsData.warranty_expiry_notification,
          repair_reminder_frequency: settingsData.repairReminderFrequency || settingsData.repair_reminder_frequency,
          ewaste_prevention_goal: parseInt(settingsData.ewastePreventionGoal || settingsData.ewaste_prevention_goal),
          co2_reduction_goal: parseFloat(settingsData.co2ReductionGoal || settingsData.co2_reduction_goal),
          local_business_support_goal: parseInt(settingsData.localBusinessSupportGoal || settingsData.local_business_support_goal),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'wallet_address'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase settings update error:', error);
        throw error;
      }

      console.log('✅ Settings updated successfully:', data);
      return data;

    } catch (error) {
      console.error('❌ Failed to update settings:', error);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count', { count: 'exact' });

      if (error) throw error;

      console.log('✅ Supabase connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
  }
}

export const supabaseSettingsService = new SupabaseSettingsService();