"use client";
import { useState } from "react";
import Link from "next/link";
import { Pencil, KeyRound, Filter, Trash, CirclePlus } from "lucide-react";
import { Button } from "@/libs/core/components/ui/Button";
import type { UserResponse } from "@/libs/shared/tts/models/user.model";
import DataTable from "@/libs/core/components/ui/DataTable";
import ListLayout from "../layout/ListLayout";
import { TableColumn } from "@/libs/core/models/component.model";
import { Switch } from "@/libs/core/components/ui/Switch";
import InitializePasswordModal from "../auth/initialize-password/InitializePasswordModal";
import {
  useDeleteUsers,
  useGetUsers,
  useToggleUserStatus,
} from "../../hooks/useUsers";
import { ConfirmDialog } from "@/libs/core/components/ui/ConfirmDialog";
import { useSearchParams } from "next/navigation";
import { GetUsersParams } from "@/libs/shared/tts/models/params.model";
import UserFilterModal from "./filter/UserFilterModal";
import { useGetMe } from "../../hooks/useAuth";
import toast from "react-hot-toast";

function UserList() {
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toggleStatusId, setToggleStatusId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");

  const FILTER_KEYS = [
    "fullname",
    "username",
    "email",
    "position",
    "roleName",
    "isActive",
  ];
  const activeFilterCount = FILTER_KEYS.filter((key) =>
    searchParams.get(key),
  ).length;

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 10;
  const isActiveParam = searchParams.get("isActive");

  const params: GetUsersParams = {
    page: page,
    size: size,
    fullname: searchParams.get("fullname") ?? undefined,
    username: searchParams.get("username") ?? undefined,
    email: searchParams.get("email") ?? undefined,
    position: searchParams.get("position") ?? undefined,
    roleName: searchParams.get("roleName") ?? undefined,
    isActive: isActiveParam === null ? undefined : isActiveParam === "true",
  };

  const { data: accountData } = useGetMe();
  const account = accountData?.data;

  const { data, isLoading } = useGetUsers(params);

  const users = data?.data ?? [];
  const isFetchingUsers = isLoading;

  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const toggleStatusMutation = useToggleUserStatus();
  const isTogglingStatus = toggleStatusMutation.isPending;

  const deleteUsersMutation = useDeleteUsers();
  const isDeletingUsers = deleteUsersMutation.isPending;

  const handleConfirmDialogDeleteUsers = () => {
    if (isDeletingUsers) return;

    const selectedUsers = users.filter((u) => selectedIds.includes(u.userId));
    const includesMe = selectedUsers.some(
      (u) => u.username === account?.username,
    );

    if (includesMe) {
      toast.error("Không được xóa chính tài khoản của mình");
      return;
    }

    setDeleteOpen(true);
  };

  const handleDeleteUsers = () => {
    if (isDeletingUsers || selectedIds.length === 0) return;

    deleteUsersMutation.mutate(
      { userIds: selectedIds },
      {
        onSuccess: () => {
          setDeleteOpen(false);
          setSelectedIds([]);
        },
        onError: () => setDeleteOpen(false),
      },
    );
  };

  const handleConfirmDialogToggleStatus = (
    userId: string,
    username: string,
  ) => {
    if (isTogglingStatus) return;

    if (username === account?.username) {
      toast.error("Không được cập nhật trạng thái của chính tài khoản mình");
      return;
    }

    setToggleStatusId(userId);
  };

  const handleToggleStatus = () => {
    if (!toggleStatusId || isTogglingStatus) return;

    toggleStatusMutation.mutate(toggleStatusId, {
      onSuccess: () => {
        setToggleStatusId(null);
      },
    });
  };

  const handleOpenInitialPasswordModal = (username: string) => {
    if (username === account?.username) {
      toast.error("Không được khởi tạo mật khẩu của chính tài khoản mình");
      return;
    }

    setModalOpen(true);
    setUsername(username);
  };

  const columns: TableColumn<UserResponse>[] = [
    { key: "username", header: "Số tài khoản", cell: (u) => u.username },
    {
      key: "fullname",
      header: "Họ và tên",
      cell: (u) => u.fullname,
    },
    { key: "email", header: "Email", cell: (u) => u.email },
    { key: "roleName", header: "Vai trò", cell: (u) => u.roleName },
    { key: "position", header: "Chức danh", cell: (u) => u.position },
    {
      key: "isActive",
      header: "Trạng thái",
      cell: (u) => (
        <Switch
          checked={u.isActive}
          onChange={() => handleConfirmDialogToggleStatus(u.userId, u.username)}
          disabled={isTogglingStatus}
        />
      ),
    },
    {
      key: "actions",
      header: "Hành động",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Link
            href={`${u.username === account?.username ? "/account" : `/users/${u.userId}`}`}
          >
            <Pencil size={22} className="text-edit" />
          </Link>

          <Button
            type="button"
            onClick={() => handleOpenInitialPasswordModal(u.username)}
          >
            <KeyRound size={22} className="text-warning" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ListLayout
        title="Danh sách người dùng"
        count={totalElements}
        actions={
          <>
            {selectedIds.length > 0 && (
              <Button
                type="button"
                onClick={handleConfirmDialogDeleteUsers}
                className="flex items-center gap-2 rounded-md bg-error px-2 py-2.5 font-medium text-white"
              >
                <Trash size={18} />
                <span>
                  Xóa{selectedIds.length > 0 && ` (${selectedIds.length})`}
                </span>
              </Button>
            )}

            <Button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 rounded-md border border-primary px-2 py-2.5 font-medium text-primary"
            >
              <Filter size={18} />
              <span>
                Bộ lọc{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </span>
            </Button>

            <Link
              href="/users/create"
              className="rounded-md bg-primary px-2 py-2.5 font-medium text-white flex items-center gap-2"
            >
              <CirclePlus size={18} strokeWidth={2} /> <span>Thêm</span>
            </Link>
          </>
        }
        pagination={{ page, size, totalElements, totalPages }}
      >
        <DataTable
          columns={columns}
          data={users}
          getRowId={(u) => u.userId}
          isLoading={isFetchingUsers}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </ListLayout>

      {modalOpen && (
        <InitializePasswordModal
          onClose={() => setModalOpen(false)}
          username={username}
        />
      )}

      {toggleStatusId && (
        <ConfirmDialog
          title="Xác nhận thay đổi trạng thái?"
          description="Bạn có chắc chắn muốn thay đổi trạng thái người dùng này?"
          confirmText="Xác nhận"
          cancelText="Hủy bỏ"
          isLoading={isTogglingStatus}
          onConfirm={handleToggleStatus}
          onClose={() => setToggleStatusId(null)}
        />
      )}

      {deleteOpen && (
        <ConfirmDialog
          title="Xác nhận xóa người dùng"
          description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} người dùng đã chọn?`}
          confirmText="Xác nhận"
          cancelText="Hủy bỏ"
          isLoading={isDeletingUsers}
          onConfirm={handleDeleteUsers}
          onClose={() => setDeleteOpen(false)}
        />
      )}

      {filterOpen && <UserFilterModal onClose={() => setFilterOpen(false)} />}
    </>
  );
}

export default UserList;
