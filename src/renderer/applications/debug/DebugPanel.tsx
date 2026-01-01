import React, { useState } from 'react';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

import { useConnectionStore } from '../../stores/useConnectionStore';
import { useTabStore } from '../../stores/useTabStore';
import { useFeatureStore } from '../../stores/useFeatureStore';
import { useUserStore } from '../../stores/useUserStore';
import { useQueryResultStore } from '../../stores/useQueryResultStore';
import { useQueryHistoryStore } from '../../stores/useQueryHistoryStore';
import { useSavedQueryStore } from '../../stores/useSavedQueryStore';
import { usePermissionUIStore } from '../../stores/usePermissionUIStore';

interface JsonViewerProps {
  data: unknown;
  initialExpanded?: boolean;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data, initialExpanded = false }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderValue = (value: unknown, path: string, depth: number): React.ReactNode => {
    const indent = depth * 16;

    if (value === null) {
      return <span style={{ color: '#808080' }}>null</span>;
    }

    if (value === undefined) {
      return <span style={{ color: '#808080' }}>undefined</span>;
    }

    if (typeof value === 'boolean') {
      return <span style={{ color: '#0000ff' }}>{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span style={{ color: '#098658' }}>{value}</span>;
    }

    if (typeof value === 'string') {
      // Truncate long strings
      const displayValue = value.length > 100 ? `${value.substring(0, 100)}...` : value;
      return <span style={{ color: '#a31515' }}>"{displayValue}"</span>;
    }

    if (typeof value === 'function') {
      return <span style={{ color: '#808080' }}>[Function]</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span style={{ color: '#808080' }}>[]</span>;
      }

      const isExpanded = expanded[path] ?? initialExpanded;

      return (
        <span>
          <span
            onClick={() => toggleExpand(path)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <CaretRightOutlined
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                marginRight: 4,
              }}
            />
            <span style={{ color: '#808080' }}>Array({value.length})</span>
          </span>
          {isExpanded && (
            <div style={{ marginLeft: indent }}>
              {value.map((item, index) => (
                <div key={index} style={{ marginLeft: 16 }}>
                  <span style={{ color: '#098658' }}>{index}</span>:{' '}
                  {renderValue(item, `${path}[${index}]`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </span>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value as Record<string, unknown>);
      if (keys.length === 0) {
        return <span style={{ color: '#808080' }}>{'{}'}</span>;
      }

      const isExpanded = expanded[path] ?? initialExpanded;

      return (
        <span>
          <span
            onClick={() => toggleExpand(path)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <CaretRightOutlined
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                marginRight: 4,
              }}
            />
            <span style={{ color: '#808080' }}>Object({keys.length})</span>
          </span>
          {isExpanded && (
            <div style={{ marginLeft: indent }}>
              {keys.map((key) => (
                <div key={key} style={{ marginLeft: 16 }}>
                  <span style={{ color: '#001080' }}>{key}</span>:{' '}
                  {renderValue(
                    (value as Record<string, unknown>)[key],
                    `${path}.${key}`,
                    depth + 1
                  )}
                </div>
              ))}
            </div>
          )}
        </span>
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div
      style={{
        fontFamily: 'Monaco, Menlo, "Courier New", monospace',
        fontSize: 12,
        lineHeight: 1.6,
        padding: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        overflow: 'auto',
        maxHeight: 400,
      }}
    >
      {renderValue(data, 'root', 0)}
    </div>
  );
};

// Helper to extract state without functions
const extractState = (store: Record<string, unknown>): Record<string, unknown> => {
  const state: Record<string, unknown> = {};
  for (const key of Object.keys(store)) {
    if (typeof store[key] !== 'function') {
      state[key] = store[key];
    }
  }
  return state;
};

const DebugPanel: React.FC = () => {
  // Subscribe to all stores
  const connectionStore = useConnectionStore();
  const tabStore = useTabStore();
  const featureStore = useFeatureStore();
  const userStore = useUserStore();
  const queryResultStore = useQueryResultStore();
  const queryHistoryStore = useQueryHistoryStore();
  const savedQueryStore = useSavedQueryStore();
  const permissionUIStore = usePermissionUIStore();

  const stores = [
    {
      key: 'connection',
      label: 'ConnectionStore',
      data: extractState(connectionStore as unknown as Record<string, unknown>),
    },
    {
      key: 'tab',
      label: 'TabStore',
      data: extractState(tabStore as unknown as Record<string, unknown>),
    },
    {
      key: 'feature',
      label: 'FeatureStore',
      data: extractState(featureStore as unknown as Record<string, unknown>),
    },
    {
      key: 'user',
      label: 'UserStore',
      data: extractState(userStore as unknown as Record<string, unknown>),
    },
    {
      key: 'queryResult',
      label: 'QueryResultStore',
      data: extractState(queryResultStore as unknown as Record<string, unknown>),
    },
    {
      key: 'queryHistory',
      label: 'QueryHistoryStore',
      data: extractState(queryHistoryStore as unknown as Record<string, unknown>),
    },
    {
      key: 'savedQuery',
      label: 'SavedQueryStore',
      data: extractState(savedQueryStore as unknown as Record<string, unknown>),
    },
    {
      key: 'permissionUI',
      label: 'PermissionUIStore',
      data: extractState(permissionUIStore as unknown as Record<string, unknown>),
    },
  ];

  const items = stores.map((store) => ({
    key: store.key,
    label: (
      <span style={{ fontWeight: 500 }}>
        {store.label}
        <span style={{ color: '#808080', marginLeft: 8, fontWeight: 400 }}>
          ({Object.keys(store.data).length} keys)
        </span>
      </span>
    ),
    children: <JsonViewer data={store.data} />,
  }));

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <h2 style={{ marginBottom: 16 }}>Zustand Store Inspector</h2>
      <p style={{ marginBottom: 16, color: '#666' }}>
        Click on a store to expand and view its current state. Click on objects/arrays to expand
        them.
      </p>
      <Collapse
        items={items}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        defaultActiveKey={['feature']}
      />
    </div>
  );
};

export default DebugPanel;
