"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "./button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
  isSilent?: boolean;
}

interface State {
  hasError: boolean;
}

export class SafeBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[SafeBoundary] Error in ${this.props.name || 'Component'}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.isSilent) {
        return null;
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 my-4 rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-900 dark:text-red-200 font-kantumruy">
              មានបញ្ហាក្នុងការបង្ហាញផ្នែកនេះ
            </h3>
            <p className="text-xs text-red-600/70 dark:text-red-400/60 font-kantumruy mt-1">
              (Error in {this.props.name || 'Component'})
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-[10px] font-bold uppercase tracking-wider"
            onClick={() => this.setState({ hasError: false })}
          >
            <RefreshCcw className="w-3 h-3 mr-2" />
            ព្យាយាមឡើងវិញ
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
