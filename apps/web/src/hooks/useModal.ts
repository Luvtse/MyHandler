import { useState, useCallback } from 'react';

export interface UseModalOptions {
  initialData?: any;
  onClose?: () => void;
}

export function useModal(options: UseModalOptions = {}) {
  const { initialData = null, onClose } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(initialData);

  const open = useCallback((modalData: any = null) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(initialData);
    onClose?.();
  }, [initialData, onClose]);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setData
  };
}

// Example usage with different modal types:
/*
// Edit User Modal
const editUserModal = useModal({
  onClose: () => {
    // Clean up or refresh data after modal closes
    refreshUsersList();
  }
});

// Delete Confirmation Modal
const deleteConfirmModal = useModal({
  initialData: {
    title: 'Delete User',
    message: 'Are you sure you want to delete this user?'
  }
});

// View Details Modal
const viewDetailsModal = useModal();

// In component:
<Button
  onClick={() => editUserModal.open(user)}
>
  Edit User
</Button>

<Modal
  isOpen={editUserModal.isOpen}
  onClose={editUserModal.close}
>
  <EditUserForm
    user={editUserModal.data}
    onSubmit={async (data) => {
      await updateUser(data);
      editUserModal.close();
    }}
  />
</Modal>

<Button
  onClick={() => deleteConfirmModal.open({ userId: user.id })}
>
  Delete User
</Button>

<AlertDialog
  isOpen={deleteConfirmModal.isOpen}
  onClose={deleteConfirmModal.close}
  onConfirm={async () => {
    await deleteUser(deleteConfirmModal.data.userId);
    deleteConfirmModal.close();
  }}
>
  {deleteConfirmModal.data?.message}
</AlertDialog>

<Button
  onClick={() => viewDetailsModal.open(user)}
>
  View Details
</Button>

<Dialog
  isOpen={viewDetailsModal.isOpen}
  onClose={viewDetailsModal.close}
>
  <UserDetails user={viewDetailsModal.data} />
</Dialog>
*/