/**
 * Refactored Integration Create/Edit Component
 * Now much smaller and focused on orchestration
 */

import { IntegrationLayout } from "./IntegrationLayout";
import { IntegrationTabNavigation, DEFAULT_TABS } from "./IntegrationTabNavigation";
import { IntegrationTabContent } from "./IntegrationTabContent";
import { useIntegrationForm } from "@/hooks/useIntegrationForm";

interface IntegrationCreateEditProps {
  integrationId?: string;
  mode: "create" | "edit";
  onBack: () => void;
  onSave: (data: any) => void;
}

// Mock users for now - replace with real API call
const mockUsers = [
  { id: "user-001", name: "John Doe", email: "john@company.com" },
  { id: "user-002", name: "Jane Smith", email: "jane@company.com" },
  { id: "user-003", name: "Bob Wilson", email: "bob@company.com" },
  { id: "user-004", name: "Alice Johnson", email: "alice@company.com" },
];

export default function IntegrationCreateEditRefactored({ 
  integrationId, 
  mode, 
  onBack, 
  onSave 
}: IntegrationCreateEditProps) {
  const {
    activeTab,
    isDraftSaved,
    formData,
    setActiveTab,
    updateFormData,
    saveIntegration,
  } = useIntegrationForm({ integrationId, mode, onSave });

  const handleSave = () => {
    saveIntegration();
  };

  return (
    <IntegrationLayout
      mode={mode}
      integrationId={integrationId}
      isDraftSaved={isDraftSaved}
      onBack={onBack}
      onSave={handleSave}
    >
      <IntegrationTabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={DEFAULT_TABS}
      >
        <IntegrationTabContent
          tabId={activeTab}
          formData={formData}
          onUpdate={updateFormData}
          users={mockUsers}
        />
      </IntegrationTabNavigation>
    </IntegrationLayout>
  );
}
