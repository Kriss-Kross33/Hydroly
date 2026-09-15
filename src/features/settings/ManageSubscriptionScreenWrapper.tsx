import React from "react";
import ManageSubscriptionScreen from "./ManageSubscriptionScreen";

// Simple wrapper - the key is that this file is only imported when MainNavigator renders,
// not at the root level of RootStack, which prevents early evaluation
export default function ManageSubscriptionScreenWrapper(props: any) {
  return <ManageSubscriptionScreen {...props} />;
}
