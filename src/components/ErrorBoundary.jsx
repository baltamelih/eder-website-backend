import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    document.documentElement.dataset.ederReactError = "visible";
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div id="eder-runtime-error">
          <Result
          status="500"
          title="Bir hata oluştu"
          subTitle="Sayfa yüklenirken bir sorun yaşandı."
          extra={<Button type="primary" onClick={() => window.location.reload()}>Sayfayı Yenile</Button>}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;