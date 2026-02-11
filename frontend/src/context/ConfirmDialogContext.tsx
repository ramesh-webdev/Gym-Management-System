import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type ConfirmDialogOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
};

type ConfirmDialogContextValue = {
  confirmDialog: (options: ConfirmDialogOptions) => Promise<boolean>;
};

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(
  null
);

type PendingDialog = ConfirmDialogOptions & {
  resolve: (value: boolean) => void;
};

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingDialog | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const open = !!pending;

  const confirmDialog = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setPending({
        ...options,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback((confirmed: boolean) => {
    if (resolveRef.current) {
      resolveRef.current(confirmed);
      resolveRef.current = null;
    }
    setPending(null);
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ confirmDialog }}>
      {children}
      <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose(false)}>
        <AlertDialogContent>
          {pending && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>{pending.title}</AlertDialogTitle>
                <AlertDialogDescription>{pending.description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => handleClose(false)}>
                  {pending.cancelLabel ?? 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleClose(true)}
                  className={
                    pending.variant === 'destructive'
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      : undefined
                  }
                >
                  {pending.confirmLabel ?? 'Confirm'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog(): (options: ConfirmDialogOptions) => Promise<boolean> {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) {
    throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  }
  return ctx.confirmDialog;
}
