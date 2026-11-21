"use client";
import { useState } from "react";
import { Pencil, KeyRound, Trash, CirclePlus, FunnelX } from "lucide-react";
import { Button } from "@/libs/core/components/ui/Button";
import DataTable from "@/libs/core/components/ui/DataTable";
import ListLayout from "../layout/ListLayout";
import { TableColumn } from "@/libs/core/models/component.model";
import { Switch } from "@/libs/core/components/ui/Switch";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ConfirmDialog } from "@/libs/core/components/ui/ConfirmDialog";
import InitializePasswordModal from "../auth/InitializePasswordModal";
import { GetEnterprisesParams } from "@/libs/shared/tts/models/params.model";
import {
  useDeleteEnterprises,
  useGetEnterprises,
} from "../../hooks/useEnterprises";
import { EnterpriseResponse } from "@/libs/shared/tts/models/enterprise.model";
import { useToggleUserStatus } from "../../hooks/useUsers";
import Link from "next/link";
import { useGetHCMWards } from "../../hooks/useLocation";
import { useGetAllBusinessTypes } from "../../hooks/useBusinessTypes";
import { useGetAllBusinessIndustries } from "../../hooks/useBusinessIndustries";
import { USER_STATUS_OPTIONS } from "@/libs/core/constants/options";

const FILTER_KEYS = [
  "name",
  "taxCode",
  "businessType",
  "businessIndustry",
  "ward",
  "isActive",
];

function EnterpriseList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toggleStatusId, setToggleStatusId] = useState<string | null>(null);
  const [initializePasswordModalOpen, setInitializePasswordModalOpen] =
    useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const page = Number(searchParams.get("page")) || 1;
  const size = Number(searchParams.get("size")) || 12;
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

  const wards = useGetHCMWards();
  const { data: businessTypeData } = useGetAllBusinessTypes();
  const { data: businessIndustryData } = useGetAllBusinessIndustries();

  const toggleStatusMutation = useToggleUserStatus();
  const isTogglingStatus = toggleStatusMutation.isPending;

  const deleteEnterprisesMutation = useDeleteEnterprises();
  const isDeletingEnterprises = deleteEnterprisesMutation.isPending;

  const businessTypeOptions = (businessTypeData?.data ?? []).map((type) => ({
    value: type.name,
    label: `${type.code} - ${type.name}`,
  }));

  const businessIndustryOptions = (businessIndustryData?.data ?? []).map(
    (industry) => ({
      value: industry.name,
      label: `${industry.code} - ${industry.name}`,
    }),
  );

  const wardOptions = (wards ?? []).map((ward) => ({
    value: ward.name,
    label: ward.name,
  }));

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

  const handleOpenInitialPasswordModal = (username: string, userId: string) => {
    setInitializePasswordModalOpen(true);
    setUsername(username);
    setUserId(userId);
  };

  const hasActiveFilter = FILTER_KEYS.some((k) => searchParams.get(k));

  const handleClearFilter = () => {
    const next = new URLSearchParams(searchParams.toString());

    FILTER_KEYS.forEach((k) => next.delete(k));
    next.delete("page");

    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const columns: TableColumn<EnterpriseResponse>[] = [
    {
      key: "actions",
      header: "Hành động",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Link href={`/enterprises/${u.enterpriseId}`}>
            <Pencil size={22} className="text-edit" />
          </Link>

          <Button
            type="button"
            onClick={() => handleOpenInitialPasswordModal(u.taxCode, u.userId)}
          >
            <KeyRound size={22} className="text-warning" />
          </Button>
        </div>
      ),
    },
    {
      key: "taxCode",
      header: "Mã số thuế",
      cell: (u) => u.taxCode,
      filter: {
        type: "text",
        paramKey: "taxCode",
        placeholder: "Nhập mã số thuế",
      },
    },
    {
      key: "name",
      header: "Tên doanh nghiệp",
      cell: (u) => u.name,
      filter: {
        type: "text",
        paramKey: "name",
        placeholder: "Nhập tên doanh nghiệp",
      },
    },
    {
      key: "businessType",
      header: "Loại hình kinh doanh",
      cell: (u) => u.businessType,
      filter: {
        type: "select",
        paramKey: "businessType",
        options: businessTypeOptions,
      },
    },
    {
      key: "businessIndustry",
      header: "Ngành nghề kinh doanh",
      cell: (u) => u.businessIndustry,
      filter: {
        type: "select",
        paramKey: "businessIndustry",
        options: businessIndustryOptions,
      },
    },
    {
      key: "ward",
      header: "Phường/xã",
      cell: (u) => u.ward,
      filter: {
        type: "select",
        paramKey: "ward",
        options: wardOptions,
      },
    },
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
      filter: {
        type: "select",
        paramKey: "isActive",
        options: USER_STATUS_OPTIONS,
      },
    },
  ];

  return (
    <>
      <ListLayout
        title="Doanh nghiệp"
        count={totalElements}
        actions={
          <>
            {selectedIds.length > 0 && (
              <Button
                type="button"
                onClick={handleConfirmDialogDeleteEnterprises}
                className="flex items-center gap-2 rounded-md bg-error px-3 py-2 font-medium text-white"
              >
                <Trash size={18} />
                <span>
                  Xóa {selectedIds.length > 0 && ` (${selectedIds.length})`}
                </span>
              </Button>
            )}

            <Link
              href="/enterprises/create"
              className="rounded-md bg-primary px-3 py-2 font-medium text-white flex items-center gap-2"
            >
              <CirclePlus size={18} strokeWidth={2} /> <span>Thêm</span>
            </Link>

            {hasActiveFilter && (
              <Button
                type="button"
                onClick={handleClearFilter}
                className="rounded-md bg-error px-3 py-2 font-medium text-white flex items-center gap-2"
              >
                <FunnelX size={18} /> <span>Xóa bộ lọc</span>
              </Button>
            )}
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

      {initializePasswordModalOpen && (
        <InitializePasswordModal
          onClose={() => setInitializePasswordModalOpen(false)}
          username={username}
          userId={userId}
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
    </>
  );
}

export default EnterpriseList;
