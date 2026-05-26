import { Component, ErrorInfo, ReactNode } from "react";
import i18n from "@/i18n";
import ErrorView from "@/components/ErrorView/ErrorView";

type Props = { children: ReactNode };
type State = { hasError: boolean };

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorView message={i18n.t("UNFORESEEN_ERROR")} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
