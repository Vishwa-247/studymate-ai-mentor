
import * as React from "react";
import { toast as sonnerToast } from "sonner";

const TOAST_LIMIT = 5;
export type ToastProps = React.ComponentPropsWithoutRef<typeof sonnerToast>;

type ToastActionElement = React.ReactElement<typeof sonnerToast>;

export type ToastActionProps = {
  altText: string;
  onClick: () => void;
  children?: React.ReactNode;
};

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  action?: ToastActionElement;
};

const actionTypes = {
  DEFAULT: "default",
  DESTRUCTIVE: "destructive",
  SUCCESS: "success",
  WARNING: "warning",
};

export const useToast = () => {
  const toast = (options: ToastOptions) => {
    const { title, description, variant, action } = options;

    switch (variant) {
      case actionTypes.DESTRUCTIVE:
        return sonnerToast.error(title, {
          description,
          action,
        });
      case actionTypes.SUCCESS:
        return sonnerToast.success(title, {
          description,
          action,
        });
      case actionTypes.WARNING:
        return sonnerToast.warning(title, {
          description,
          action,
        });
      default:
        return sonnerToast(title, {
          description,
          action,
        });
    }
  };

  return {
    toast,
    dismiss: sonnerToast.dismiss,
    actionTypes,
  };
};

export const toast = {
  DEFAULT: (title: string, description?: string) => {
    sonnerToast(title, {
      description,
    });
  },
  ERROR: (title: string, description?: string) => {
    sonnerToast.error(title, {
      description,
    });
  },
  SUCCESS: (title: string, description?: string) => {
    sonnerToast.success(title, {
      description,
    });
  },
  WARNING: (title: string, description?: string) => {
    sonnerToast.warning(title, {
      description,
    });
  },
};
