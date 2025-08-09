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
  NumberInput
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX, IconDeviceFloppy } from "@tabler/icons-react";
import { supabaseSellerService } from "../services/supabaseSellerService";

const SellerSettings = () => {
  // ✅ Always call hooks at the top level - never conditionally
  const [profile, setProfile] = useState({
    business_name: '',
    business_email: '',
    business_address: ''
  });
  
  const [settings, setSettings] = useState({
    default_warranty_period: 365,
    default_warranty_price: 25.00
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Import currentAccount from useWarranties
  const { currentAccount } = require("../hooks/useWarranties").useWarranties();


  // ✅ Calculate wallet address safely
  const walletAddress = currentAccount?.address || '0x15da713cf950a2905d394a3120ae78c8af4b53a8be72a6a712c5aa56a6ba303d';

  // ✅ Always call useEffect - but make the logic inside conditional
  useEffect(() => {
    // Only load if we have wallet address
    if (walletAddress) {
      loadSellerSettings();
    }
  }, [walletAddress]); // Add dependency array

  const loadSellerSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Loading seller settings for wallet: ${walletAddress}`);
      
      const result = await supabaseSellerService.getSellerSettings(walletAddress);
      
      setProfile({
        business_name: result.profile.business_name || '',
        business_email: result.profile.business_email || '',
        business_address: result.profile.business_address || ''
      });

      setSettings({
        default_warranty_period: result.settings.default_warranty_period || 365,
        default_warranty_price: result.settings.default_warranty_price || 25.00
      });

      console.log('✅ Seller settings loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to load seller settings:', error);
      setError('Failed to load your seller settings. Please try again.');
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
      console.log('💾 Saving seller settings...', { profile, settings });

      const [profileResult, settingsResult] = await Promise.all([
        supabaseSellerService.updateSellerProfile(walletAddress, profile),
        supabaseSellerService.updateSellerSettings(walletAddress, settings)
      ]);

      console.log('✅ Seller settings saved successfully');

      notifications.show({
        title: 'Settings Saved!',
        message: 'Your business profile and preferences have been updated successfully.',
        color: 'green',
        icon: <IconCheck size={16} />
      });

      await loadSellerSettings();

    } catch (error) {
      console.error('❌ Failed to save seller settings:', error);
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
      
      <Title order={2} mb="xl">Settings</Title>

      {error && (
        <Alert color="red" mb="md" icon={<IconX size={16} />}>
          {error}
        </Alert>
      )}

      <Paper shadow="xs" p="md" mb="xl">
        <Title order={4} mb="md">
          Business Profile
        </Title>
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Business Name"
              placeholder="Your Business Name"
              value={profile.business_name}
              onChange={(e) => setProfile({...profile, business_name: e.target.value})}
              mb="md"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Business Email"
              placeholder="contact@yourbusiness.com"
              value={profile.business_email}
              onChange={(e) => setProfile({...profile, business_email: e.target.value})}
              mb="md"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Business Address"
              placeholder="Your Business Address"
              value={profile.business_address}
              onChange={(e) => setProfile({...profile, business_address: e.target.value})}
              mb="md"
            />
          </Grid.Col>
        </Grid>
      </Paper>

      <Paper shadow="xs" p="md" mb="xl">
        <Title order={4} mb="md">
          Warranty Settings
        </Title>
        <Grid>
          <Grid.Col span={6}>
            <Select
              label="Default Warranty Period"
              data={[
                { value: "90", label: "90 Days" },
                { value: "180", label: "180 Days" },
                { value: "365", label: "1 Year" },
                { value: "730", label: "2 Years" },
                { value: "1095", label: "3 Years" },
              ]}
              value={settings.default_warranty_period.toString()}
              onChange={(value) => setSettings({...settings, default_warranty_period: parseInt(value)})}
              mb="md"
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Default Warranty Price ($)"
              placeholder="25.00"
              value={settings.default_warranty_price}
              onChange={(value) => setSettings({...settings, default_warranty_price: value})}
              mb="md"
              min={0}
              max={10000}
              precision={2}
              step={0.50}
            />
          </Grid.Col>
        </Grid>
      </Paper>

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

export default SellerSettings;