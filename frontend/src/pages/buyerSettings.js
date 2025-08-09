import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Paper,
  Grid,
  TextInput,
  Select,
  Button,
  Group,
  Alert,
  LoadingOverlay,
  NumberInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX, IconDeviceFloppy } from "@tabler/icons-react";
import { supabaseSettingsService } from "../services/supabaseSettingsService";

const BuyerSettings = () => {
  // State for form data
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    wallet_address: ''
  });
  
  const [settings, setSettings] = useState({
    warranty_expiry_notification: '7 days before',
    repair_reminder_frequency: 'Monthly',
    ewaste_prevention_goal: 100,
    co2_reduction_goal: 2,
    local_business_support_goal: 5
  });

  // State for UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Import currentAccount from useWarranties
  const { currentAccount } = require("../hooks/useWarranties").useWarranties();

  // Get current wallet
  const walletAddress = currentAccount?.address || '0x15da713cf950a2905d394a3120ae78c8af4b53a8be72a6a712c5aa56a6ba303d';

  // Load user settings on component mount
  useEffect(() => {
    loadUserSettings();
  }, [walletAddress]);

  const loadUserSettings = async () => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Loading settings for wallet: ${walletAddress}`);
      
      const result = await supabaseSettingsService.getUserSettings(walletAddress);
      
      // Update profile state
      setProfile({
        full_name: result.profile.full_name || '',
        email: result.profile.email || '',
        wallet_address: walletAddress
      });

      // Update settings state
      setSettings({
        warranty_expiry_notification: result.settings.warranty_expiry_notification || '7 days before',
        repair_reminder_frequency: result.settings.repair_reminder_frequency || 'Monthly',
        ewaste_prevention_goal: result.settings.ewaste_prevention_goal || 100,
        co2_reduction_goal: result.settings.co2_reduction_goal || 2,
        local_business_support_goal: result.settings.local_business_support_goal || 5
      });

      console.log('✅ Settings loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      setError('Failed to load your settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!walletAddress) {
      setError('No wallet connected');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      console.log('💾 Saving settings...', { profile, settings });

      // Save profile and settings in parallel
      const [profileResult, settingsResult] = await Promise.all([
        supabaseSettingsService.updateUserProfile(walletAddress, profile),
        supabaseSettingsService.updateUserSettings(walletAddress, settings)
      ]);

      console.log('✅ Settings saved successfully');

      // Show success notification
      notifications.show({
        title: 'Settings Saved!',
        message: 'Your profile and preferences have been updated successfully.',
        color: 'green',
        icon: <IconCheck size={16} />
      });

      // Reload data to confirm save
      await loadUserSettings();

    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      setError(`Failed to save settings: ${error.message}`);
      
      notifications.show({
        title: 'Save Failed',
        message: 'Could not save your settings. Please try again.',
        color: 'red',
        icon: <IconX size={16} />
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container size="xl" style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} overlayBlur={2} />
      
      {/* Simple title without buttons */}
      <Title order={2} mb="xl">Settings</Title>

      {error && (
        <Alert color="red" mb="md" icon={<IconX size={16} />}>
          {error}
        </Alert>
      )}

      {/* Personal Profile Section */}
      <Paper shadow="xs" p="md" mb="xl">
        <Title order={4} mb="md">
          Personal Profile
        </Title>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Full Name"
              placeholder="Your Full Name"
              value={profile.full_name}
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              mb="md"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Email Address"
              placeholder="your.email@example.com"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              mb="md"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Wallet Address"
              value={walletAddress}
              mb="md"
              disabled
              description="This is your connected wallet address (read-only)"
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Notification Settings Section */}
      <Paper shadow="xs" p="md" mb="xl">
        <Title order={4} mb="md">
          Notification Settings
        </Title>
        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Warranty Expiry Notifications"
              data={[
                { value: "30 days before", label: "30 days before" },
                { value: "14 days before", label: "14 days before" },
                { value: "7 days before", label: "7 days before" },
                { value: "1 day before", label: "1 day before" },
              ]}
              value={settings.warranty_expiry_notification}
              onChange={(value) => setSettings({...settings, warranty_expiry_notification: value})}
              mb="md"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Repair Reminder Frequency"
              data={[
                { value: "Weekly", label: "Weekly" },
                { value: "Monthly", label: "Monthly" },
                { value: "Quarterly", label: "Quarterly" },
                { value: "Never", label: "Never" },
              ]}
              value={settings.repair_reminder_frequency}
              onChange={(value) => setSettings({...settings, repair_reminder_frequency: value})}
              mb="md"
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Sustainability Preferences Section */}
      <Paper shadow="xs" p="md" mb="xl">
        <Title order={4} mb="md">
          Sustainability Preferences
        </Title>
        <Grid>
          <Grid.Col span={4}>
            <NumberInput
              label="E-waste Prevention Goal (kg)"
              placeholder="100"
              value={settings.ewaste_prevention_goal}
              onChange={(value) => setSettings({...settings, ewaste_prevention_goal: value})}
              mb="md"
              min={0}
              max={10000}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="CO2 Reduction Goal (tons)"
              placeholder="2"
              value={settings.co2_reduction_goal}
              onChange={(value) => setSettings({...settings, co2_reduction_goal: value})}
              mb="md"
              min={0}
              max={100}
              precision={1}
              step={0.1}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label="Local Business Support Goal"
              placeholder="5"
              value={settings.local_business_support_goal}
              onChange={(value) => setSettings({...settings, local_business_support_goal: value})}
              mb="md"
              min={0}
              max={100}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Save Button Section - Keep only this one */}
      <Paper shadow="xs" p="md" bg="gray.0">
        <Group position="center">
          <Button
            size="lg"
            leftIcon={<IconDeviceFloppy size={18} />}
            onClick={handleSaveSettings}
            loading={saving}
            disabled={loading}
          >
            {saving ? 'Saving Your Settings...' : 'Save All Settings'}
          </Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default BuyerSettings;