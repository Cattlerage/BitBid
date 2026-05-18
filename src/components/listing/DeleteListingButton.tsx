'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  deleteListing,
  type DeleteListingState,
} from '@/server/actions/deleteListing';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

type DeleteListingButtonProps = {
  listingId: string;
  className?: string;
  triggerClassName?: string;
  triggerSize?: 'xs' | 'sm' | 'default';
  triggerLabel?: string;
  onDeleted?: (listingId: string) => void;
  redirectTo?: string;
};

const INITIAL_STATE: DeleteListingState = null;

export default function DeleteListingButton({
  listingId,
  className,
  triggerClassName,
  triggerSize = 'sm',
  triggerLabel = 'Delete listing',
  onDeleted,
  redirectTo,
}: DeleteListingButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    deleteListing,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (!state) return;

    if (state.error) {
      toast.error(state.error);
      return;
    }

    if (state.success) {
      toast.success('Listing deleted successfully.');
      onDeleted?.(listingId);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    }
  }, [listingId, onDeleted, redirectTo, router, state]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type='button'
          variant='destructive'
          size={triggerSize}
          className={cn(
            'w-auto gap-1.5 sm:w-auto',
            triggerSize === 'xs' ? 'px-2 py-1' : '',
            triggerClassName,
          )}
        >
          <Trash2 className='h-3.5 w-3.5' />
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className={className}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent. Your listing and all bids on it will be
            removed forever.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

          <form action={formAction} className='w-full sm:w-auto'>
            <input type='hidden' name='listingId' value={listingId} />
            <AlertDialogAction asChild>
              <Button
                type='submit'
                variant='destructive'
                disabled={isPending}
                className='w-full sm:w-auto'
              >
                {isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Deleting...
                  </>
                ) : (
                  'Yes, delete permanently'
                )}
              </Button>
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
