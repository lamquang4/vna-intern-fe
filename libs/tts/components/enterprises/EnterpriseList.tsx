"use client";
import { useState } from "react";
import { Pencil, KeyRound, Filter, Trash, CirclePlus } from "lucide-react";
import { Button } from "@/libs/core/components/ui/Button";
import DataTable from "@/libs/core/components/ui/DataTable";
import ListLayout from "../layout/ListLayout";
import { TableColumn } from "@/libs/core/models/component.model";
import { Switch } from "@/libs/core/components/ui/Switch";
import { useSearchParams } from "next/navigation";
import { ConfirmDialog } from "@/libs/core/components/ui/ConfirmDialog";
import EnterpriseFilterModal from "./filter/EnterpriseFilterModal";
import InitializePasswordModal from "../auth/initialize-password/InitializePasswordModal";
import { GetEnterprisesParams } from "@/libs/shared/tts/models/params.model";
import {
  useDeleteEnterprises,
  useGetEnterprises,
} from "../../hooks/useEnterprises";
import { EnterpriseResponse } from "@/libs/shared/tts/models/enterprise.model";
import CreateEnterpriseModal from "./create-enterprise/CreateEnterpriseModal";
import { useToggleUserStatus } from "../../hooks/useUsers";
import EditEnterpriseModal from "./edit-enterprise/EditEnterpriseModal";

function EnterpriseList() {
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toggleStatusId, setToggleStatusId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalCreateOpen, setModalCreateOpen] = useState<boolean>(false);
  const [editingEnterpriseId, setEditingEnterpriseId] = useState<string | null>(
    null,
  );
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");

  const FILTER_KEYS = [
    "name",
    "taxCode",
    "businessType",
    "businessIndustry",
    "ward",
    "isActive",
  ];
  const activeFilterCount = FILTER_KEYS.filter((key) =>
    searchParams.get(key),
  ).length;

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 10;
  const isActiveParam = searchParams.get("isActive");

  const params: GetEnterprisesParams = {
    page: page,
    size: size,
    name: searchParams.get("name") ?? undefined,
    taxCode: searchParams.get("taxCode") ?? undefined,
    businessType: searchParams.get("businessType") ?? undefined,
    businessIndustry: searchParams.get("businessIndustry") ?? undefined,
    ward: searchParams.get("ward") ?? undefined,
    isActive: isActiveParam === null ? undefined : isActiveParam === "true",
  };

  const { data, isLoading } = useGetEnterprises(params);

  const enterprises = data?.data ?? [];
  const isFetchingEnterprises = isLoading;

  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const toggleStatusMutation = useToggleUserStatus();
  const isTogglingStatus = toggleStatusMutation.isPending;

  const deleteEnterprisesMutation = useDeleteEnterprises();
  const isDeletingEnterprises = deleteEnterprisesMutation.isPending;

  const handleConfirmDialogDeleteEnterprises = () => {
    if (isDeletingEnterprises) return;

    setDeleteOpen(true);
  };

  const handleDeleteEnterprises = () => {
    if (isDeletingEnterprises || selectedIds.length === 0) return;

    deleteEnterprisesMutation.mutate(
      { enterpriseIds: selectedIds },
      {
        onSuccess: () => {
          setDeleteOpen(false);
          setSelectedIds([]);
        },
        onError: () => setDeleteOpen(false),
      },
    );
  };

  const handleConfirmDialogToggleStatus = (userId: string) => {
    if (isTogglingStatus) return;

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
    setModalOpen(true);
    setUsername(username);
  };

  const columns: TableColumn<EnterpriseResponse>[] = [
    {
      key: "taxCode",
      header: "Mã số thuế",
      cell: (u) => u.taxCode,
    },
    { key: "name", header: "Tên doanh nghiệp", cell: (u) => u.name },

    {
      key: "businessType",
      header: "Loại hình kinh doanh",
      cell: (u) => u.businessType,
    },
    {
      key: "businessIndustry",
      header: "Ngành nghề kinh doanh",
      cell: (u) => u.businessIndustry,
    },
    { key: "ward", header: "Phường/xã", cell: (u) => u.ward },
    {
      key: "isActive",
      header: "Trạng thái",
      cell: (u) => (
        <Switch
          checked={u.isActive}
          onChange={() => handleConfirmDialogToggleStatus(u.userId)}
          disabled={isTogglingStatus}
        />
      ),
    },
    {
      key: "actions",
      header: "Hành động",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => setEditingEnterpriseId(u.enterpriseId)}
          >
            <Pencil size={22} className="text-edit" />
          </Button>

          <Button
            type="button"
            onClick={() => handleOpenInitialPasswordModal(u.taxCode)}
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
        title="Danh sách doanh nghiệp"
        count={totalElements}
        actions={
          <>
            {selectedIds.length > 0 && (
              <Button
                type="button"
                onClick={handleConfirmDialogDeleteEnterprises}
                className="flex items-center gap-2 rounded-md bg-error px-2 py-2.5 font-medium text-white"
              >
                <Trash size={18} />
                <span>
                  Xóa {selectedIds.length > 0 && ` (${selectedIds.length})`}
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
                Bộ lọc {activeFilterCount > 0 && ` (${activeFilterCount})`}
              </span>
            </Button>

            <Button
              onClick={() => setModalCreateOpen(true)}
              className="rounded-md bg-primary px-2 py-2.5 font-medium text-white flex items-center gap-2"
            >
              <CirclePlus size={18} strokeWidth={2} /> <span>Thêm</span>
            </Button>
          </>
        }
        pagination={{ page, size, totalElements, totalPages }}
      >
        <DataTable
          columns={columns}
          data={enterprises}
          getRowId={(u) => u.enterpriseId}
          isLoading={isFetchingEnterprises}
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
          isLoading={isDeletingEnterprises}
          onConfirm={handleDeleteEnterprises}
          onClose={() => setDeleteOpen(false)}
        />
      )}

      {filterOpen && (
        <EnterpriseFilterModal onClose={() => setFilterOpen(false)} />
      )}

      {modalCreateOpen && (
        <CreateEnterpriseModal onClose={() => setModalCreateOpen(false)} />
      )}

      {editingEnterpriseId && (
        <EditEnterpriseModal
          enterpriseId={editingEnterpriseId}
          onClose={() => setEditingEnterpriseId(null)}
        />
      )}
    </>
  );
}

export default EnterpriseList;
