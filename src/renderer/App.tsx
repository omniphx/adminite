import React, { ReactElement, Suspense, useEffect, lazy } from 'react';
import { ApplicationState } from './store/index';

//Apps
const Permissions = lazy(() =>
  import('./applications/fieldLevelSecurity/Permissions')
);
const QueryTabs = lazy(() => import('./applications/soql/QueryTabs'));

import { Layout, Menu, Spin, Button, Modal } from 'antd';
import OrgSelector from './applications/orgSelector/OrgSelector';
import NewOrgModal from './applications/orgSelector/NewOrgModal';
const { Sider, Content } = Layout;
import { ipcRenderer, shell } from 'electron';
import {
  initializeConnection,
  onConnectionCreate
} from './store/connections/actions';
import { toggleModal } from './store/connections/actions';
import { onFeatureChange } from './store/feature/actions';
import { useDispatch, useSelector } from 'react-redux';
import IconWrapper from './applications/ui/IconWrapper';
import { FaDatabase, FaTools, FaUnlockAlt } from 'react-icons/fa';
import UpdateNotification from './applications/UpdateNotification';
import * as os from 'os';
import SchemaExplorer from './applications/schemaExplorer/SchemaExplorer';

const App = (): ReactElement => {
  const dispatch = useDispatch();
  const feature = useSelector(
    (state: ApplicationState) => state.featureState.feature
  );
  const connection = useSelector(
    (state: ApplicationState) => state.connectionState.connection
  );
  const error = useSelector(
    (state: ApplicationState) => state.connectionState.error
  );

  useEffect(() => {
    dispatch(initializeConnection());
    ipcRenderer.on('new-connection', handleNewConnection);
    return () => {
      ipcRenderer.removeListener('new-connection', handleNewConnection);
    };
  }, []);

  useEffect(() => {
    const confirmedOffline = localStorage.getItem('offline-update');
    if (confirmedOffline === null) {
      Modal.info({
        title: 'Hi folks!',
        width: 600,
        content: (
          <div>
            <p>
              Due to high server costs and recent outages, I've decided to
              remove cloud storage from Adminite. Your data will now live
              securely with you on the app.
            </p>
            <p>
              Unfortunately, you will need to reconfigure a few things. Feel
              free to reach me at{' '}
              <a href='mailto:mattjmitchener@gmail.com'>
                mattjmitchener@gmail.com
              </a>
              {', '}
              if you'd like to recover your saved queries.
            </p>
            <p>
              I've also decided to opensource Adminite to provide more
              transparency and create an environment to improve innovation.
            </p>
            <p>Thanks!</p>
          </div>
        ),
        onOk() {
          localStorage.setItem('offline-update', 'done');
        }
      });
    }
  }, []);

  async function handleNewConnection(event, connection: any) {
    await dispatch(onConnectionCreate(connection));
    await dispatch(toggleModal());
  }

  const handleOrgOpen = () => {
    shell.openExternal(
      `${connection.instanceUrl}/secur/frontdoor.jsp?sid=${connection.accessToken}`
    );
  };

  const Feature = () => {
    switch (feature) {
      case 'soql':
        return <QueryTabs />;
      case 'permissions':
        return <Permissions />;
      case 'schema':
        return <SchemaExplorer />;
      default:
        return <QueryTabs />;
    }
  };

  const OrgDetails = () => {
    if (!connection) return <div />;

    return (
      <div style={{ textAlign: 'right', fontSize: 10, marginBottom: '1em' }}>
        <APIUsage />
        <OrgLauncher />
      </div>
    );
  };

  const Application = () => {
    const handleMenuItem = (event: any) => {
      dispatch(onFeatureChange(event.key));
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
              left: 0
            }}
          >
            <OrgSelector />
            <Menu
              theme='light'
              mode='inline'
              onSelect={handleMenuItem}
              selectedKeys={[feature]}
              defaultSelectedKeys={[feature]}
            >
              <Menu.Item key='soql' className='hover'>
                <IconWrapper>
                  <FaDatabase />
                </IconWrapper>
                <span>SOQL Editor</span>
              </Menu.Item>
              <Menu.Item key='permissions' className='hover'>
                <IconWrapper>
                  <FaUnlockAlt />
                </IconWrapper>
                <span>Field Level Security</span>
              </Menu.Item>
              <Menu.Item key='schema' className='hover'>
                <IconWrapper>
                  <FaTools />
                </IconWrapper>
                <span>Schema</span>
              </Menu.Item>
              {/* <Menu.Item key='debugLogs' className='hover' disabled>
                <Icon type='file-text' theme='filled' />
                <span>Debug Logs</span>
              </Menu.Item> */}
            </Menu>
          </Sider>
          <Layout style={{ marginLeft: 200 }}>
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
                      minHeight: '100vh'
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
          disabled={error}
        >
          Open org
        </Button>
      </div>
    );
  };

  const APIUsage = () => {
    if (!connection['limitInfo']) return <div />;
    if (!connection['limitInfo'].apiUsage) return <div />;
    const { used, limit } = connection['limitInfo'].apiUsage;

    return (
      <div>
        API usage: {used}/{limit}
      </div>
    );
  };

  return <Application />;
};

export default App;
