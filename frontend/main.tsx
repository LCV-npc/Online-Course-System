  import React from 'react';
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    render() {
      if (this.state.hasError) {
        return (
          <div style={{ padding: 20, color: 'red', background: '#fff' }}>
            <h1>Đã xảy ra lỗi (Crash)!</h1>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>{this.state.error?.stack}</pre>
          </div>
        );
      }
      return this.props.children;
    }
  }

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );