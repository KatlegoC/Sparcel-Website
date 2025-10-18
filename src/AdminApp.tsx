import { QRCodeTest } from "./components/QRCodeTest";
import { AdminPortalPreview } from "./components/AdminPortalPreview";
import { SupabaseSetupChecker } from "./components/SupabaseSetupChecker";
import { useState } from "react";
import "./App.css";

export default function AdminApp() {
  const [currentView, setCurrentView] = useState<'admin' | 'test' | 'preview' | 'setup'>('admin');

  // Check URL parameters for view switching
  const urlParams = new URLSearchParams(window.location.search);
  const view = urlParams.get('view') as 'admin' | 'test' | 'preview' | 'setup';
  
  if (view && view !== currentView) {
    setCurrentView(view);
  }

  if (currentView === 'admin') {
    return <AdminPortalPreview />;
  }

  if (currentView === 'test') {
    return <QRCodeTest />;
  }

  if (currentView === 'preview') {
    return <AdminPortalPreview />;
  }

  if (currentView === 'setup') {
    return <SupabaseSetupChecker />;
  }

  return <AdminPortalPreview />;
}
