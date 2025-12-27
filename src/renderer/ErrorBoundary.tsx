import React, { Component } from 'react';
import { ipcRenderer, shell } from 'electron';
import { Result, Button } from 'antd';

class ExampleBoundary extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error);
    console.error(error.message);
    console.error(errorInfo);
    ipcRenderer.send('error', JSON.stringify(error));
  }

  render() {
    if (this.state.hasError) {
      //render fallback UI
      return (
        <Result
          status='500'
          title='Sorry, looks like something bad happened.'
          subTitle={
            <>
              <div>
                If this keeps happening, please report your issue{' '}
                <Button
                  style={{ margin: 0, padding: 0 }}
                  onClick={() =>
                    shell.openExternal(
                      'https://github.com/omniphx/adminite/issues/new'
                    )
                  }
                  type='link'
                >
                  here.
                </Button>
              </div>
            </>
          }
          extra={
            <Button
              onClick={() => {
                ipcRenderer.send('refresh');
              }}
              type='primary'
            >
              Refresh
            </Button>
          }
        />
      );
    }

    //when there's not an error, render children untouched
    return this.props.children;
  }
}

export default ExampleBoundary;
