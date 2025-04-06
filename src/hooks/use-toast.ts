
import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning";
  action?: React.ReactElement;
};

export const useToast = () => {
  const toast = (options: ToastOptions) => {
    const { title, description, variant, action } = options;

    switch (variant) {
      case "destructive":
        return sonnerToast.error(title, {
          description,
          action,
        });
      case "success":
        return sonnerToast.success(title, {
          description,
          action,
        });
      case "warning":
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
    actionTypes: {
      DEFAULT: "default",
      DESTRUCTIVE: "destructive",
      SUCCESS: "success",
      WARNING: "warning",
    },
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
