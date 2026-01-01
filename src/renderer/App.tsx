import React, { ReactElement, Suspense, useEffect, lazy } from 'react';

//Apps
const Permissions = lazy(() => import('./applications/fieldLevelSecurity/Permissions'));
const QueryTabs = lazy(() => import('./applications/soql/QueryTabs'));
const DebugPanel = lazy(() => import('./applications/debug/DebugPanel'));

const isDevelopment = process.env.NODE_ENV === 'development';

import { Layout, Menu, Spin, Button, Modal } from 'antd';
import OrgSelector from './applications/orgSelector/OrgSelector';
import NewOrgModal from './applications/orgSelector/NewOrgModal';
const { Sider, Content } = Layout;
import { ipcRenderer, shell } from 'electron';
import IconWrapper from './applications/ui/IconWrapper';
import { FaDatabase, FaTools, FaUnlockAlt, FaBug } from 'react-icons/fa';
import UpdateNotification from './applications/UpdateNotification';
import * as os from 'os';
import SchemaExplorer from './applications/schemaExplorer/SchemaExplorer';
import { useFeatureStore, Feature } from './stores/useFeatureStore';
import { useConnectionStore, getActiveConnection } from './stores/useConnectionStore';
import { useSavedQueryStore } from './stores/useSavedQueryStore';
import { useConnectionQuery } from './queries/useConnectionQuery';

const App = (): ReactElement => {
  const feature = useFeatureStore((state) => state.feature);
  const setFeature = useFeatureStore((state) => state.setFeature);

  // Zustand connection store
  const addConnection = useConnectionStore((state) => state.addConnection);
  const updateConnection = useConnectionStore((state) => state.updateConnection);
  const setActiveConnectionId = useConnectionStore((state) => state.setActiveConnectionId);
  const toggleModal = useConnectionStore((state) => state.toggleModal);
  const initializeConnectionsFromLegacyStorage = useConnectionStore(
    (state) => state.initializeFromLegacyStorage
  );
  const initializeSavedQueriesFromLegacyStorage = useSavedQueryStore(
    (state) => state.initializeFromLegacyStorage
  );
  const connectionOrder = useConnectionStore((state) => state.connectionOrder);
  const activeConnection = useConnectionStore(getActiveConnection);
  const error = useConnectionStore((state) => state.activeConnection.error);

  // TanStack Query for connection identity/userInfo (Phase 4)
  useConnectionQuery();

  useEffect(() => {
    // Migrate from legacy localStorage format if needed
    initializeConnectionsFromLegacyStorage();
    initializeSavedQueriesFromLegacyStorage();

    // If we have connections but no active one selected, select the first
    if (connectionOrder.length > 0) {
      const firstConnectionId = connectionOrder[0];
      setActiveConnectionId(firstConnectionId);
      // TanStack Query will automatically fetch identity when activeConnectionId changes
    }

    ipcRenderer.on('new-connection', handleNewConnection);

    // Listen for token refresh events from the main process
    // This happens when jsforce automatically refreshes an expired access token
    const handleTokenRefresh = (
      _event: any,
      { connectionId, accessToken }: { connectionId: string; accessToken: string }
    ) => {
      console.log('Token refreshed for connection:', connectionId);
      updateConnection(connectionId, { accessToken });
    };
    ipcRenderer.on('token-refreshed', handleTokenRefresh);

    return () => {
      ipcRenderer.removeListener('new-connection', handleNewConnection);
      ipcRenderer.removeListener('token-refreshed', handleTokenRefresh);
    };
  }, []);

  async function handleNewConnection(event, connectionData: any) {
    const newConnection = addConnection(connectionData);
    setActiveConnectionId(newConnection.id);
    // TanStack Query will automatically fetch identity when activeConnectionId changes
    toggleModal();
  }

  const handleOrgOpen = () => {
    if (activeConnection) {
      shell.openExternal(
        `${activeConnection.instanceUrl}/secur/frontdoor.jsp?sid=${activeConnection.accessToken}`
      );
    }
  };

  const Feature = () => {
    switch (feature) {
      case 'soql':
        return <QueryTabs />;
      case 'permissions':
        return <Permissions />;
      case 'schema':
        return <SchemaExplorer />;
      case 'debug':
        return <DebugPanel />;
      default:
        return <QueryTabs />;
    }
  };

  const OrgDetails = () => {
    if (!activeConnection) return <div />;

    return (
      <div style={{ textAlign: 'right', fontSize: 10, marginBottom: '1em' }}>
        <APIUsage />
        <OrgLauncher />
      </div>
    );
  };

  const Application = () => {
    const handleMenuItem = (event: any) => {
      setFeature(event.key as Feature);
    };

    return (
      <div>
        {os.type() === 'Darwin' && <div className='titlebar' />}
        <Layout>
          <Sider
            className='background'
            style={{
              background: '#fff',
              overflow: 'auto',
              height: '100vh',
              position: 'fixed',
              paddingTop: '.5em',
              left: 0,
            }}
          >
            <OrgSelector />
            <Menu
              theme='light'
              mode='inline'
              onSelect={handleMenuItem}
              selectedKeys={[feature]}
              defaultSelectedKeys={[feature]}
              items={[
                {
                  key: 'soql',
                  className: 'hover',
                  icon: (
                    <IconWrapper>
                      <FaDatabase />
                    </IconWrapper>
                  ),
                  label: 'SOQL Editor',
                },
                {
                  key: 'permissions',
                  className: 'hover',
                  icon: (
                    <IconWrapper>
                      <FaUnlockAlt />
                    </IconWrapper>
                  ),
                  label: 'Field Level Security',
                },
                {
                  key: 'schema',
                  className: 'hover',
                  icon: (
                    <IconWrapper>
                      <FaTools />
                    </IconWrapper>
                  ),
                  label: 'Schema',
                },
                // Debug panel - only in development
                ...(isDevelopment
                  ? [
                      {
                        key: 'debug',
                        className: 'hover',
                        icon: (
                          <IconWrapper>
                            <FaBug />
                          </IconWrapper>
                        ),
                        label: 'Debug Stores',
                      },
                    ]
                  : []),
              ]}
            />
          </Sider>
          <Layout style={{ marginLeft: 200, height: '100vh' }}>
            <Content style={{ padding: '.5em 2em', background: '#fff' }}>
              <Suspense
                fallback={
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                      minHeight: '100vh',
                    }}
                  >
                    <Spin size='large' />
                  </div>
                }
              >
                <OrgDetails />
                <Feature />
              </Suspense>
            </Content>
          </Layout>
        </Layout>
        <NewOrgModal />
        <div style={{ padding: 25, position: 'fixed', left: 0, bottom: 0 }}>
          {/* <div>{`Version ${remote.app.getVersion()}`}</div> */}
          <UpdateNotification />
        </div>
      </div>
    );
  };

  const OrgLauncher = () => {
    return (
      <div>
        <Button
          type='link'
          style={{ padding: 0, fontSize: 10, height: 'auto' }}
          onClick={handleOrgOpen}
          disabled={!!error}
        >
          Open org
        </Button>
      </div>
    );
  };

  const APIUsage = () => {
    // API usage info is not available in StoredConnection
    // This would need to come from a query response with limitInfo
    // For now, return empty since we don't track API usage in Zustand
    return <div />;
  };

  return <Application />;
};

export default App;
