"use client";



import type { ChangeEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";


type Booking = {

  id: number;

  bookingCode: string;

  vehicleId: number;

  driverId: number | null;

  requesterId: number;

  createdAt?: string | Date;

  startDatetime: string | Date;

  endDatetime: string | Date;

  destination: string;

  purpose?: string | null;

  passengerCount?: number | null;

  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";

  notes?: string | null;

  license_plate?: string | null;

  brand_model?: string | null;

  driver_name?: string | null;

  requester_name?: string | null;

  requester_department?: string | null;

  requester_position?: string | null;

};



type Vehicle = {

  id: number;

  licensePlate: string;

  brandModel: string;

  vehicleType: string;

  capacity: number;

  status: "available" | "in_use" | "maintenance";

  assignedDriverId?: number | null;

  driver_name?: string | null;

  driver_phone?: string | null;

};



type Driver = {

  id: number;

  name: string;

  phone: string;

  licenseNo: string;

  experienceYears: number;

  status: "active" | "inactive";

};



type PublicUser = {

  id: number;

  username: string;

  fullName: string;

  role: "admin" | "approver" | "user";

  department?: string | null;

  position?: string | null;

  status: "active" | "inactive";

};



type TabKey = "bookings" | "vehicles" | "drivers" | "users";



type Props = {
  bookings: Booking[];
  vehicles: Vehicle[];
  drivers: Driver[];
  users: PublicUser[];
  canViewUsers: boolean;
  canCreateBooking: boolean;
  canApprove: boolean;
};


const TAB_LABELS: Record<TabKey, string> = {
  bookings: "ขอใช้รถ",
  vehicles: "ยานพาหนะ",
  drivers: "พนักงานขับรถ",
  users: "ผู้ใช้งาน",
};



export function TabSwitcher({ bookings, vehicles, drivers, users, canViewUsers, canCreateBooking, canApprove }: Props) {

  const router = useRouter();

  const [active, setActive] = useState<TabKey>("bookings");

  const [printBooking, setPrintBooking] = useState<Booking | null>(null);

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [editingUser, setEditingUser] = useState<PublicUser | null>(null);

  const [vehicleModalMode, setVehicleModalMode] = useState<"edit" | "create">("edit");

  const [driverModalMode, setDriverModalMode] = useState<"edit" | "create">("edit");

  const [userModalMode, setUserModalMode] = useState<"edit" | "create">("edit");



  const visibleTabs = useMemo(
    () =>
      (canViewUsers
        ? ["bookings", "vehicles", "drivers", "users"]
        : ["bookings"]) as TabKey[],
    [canViewUsers],
  );



  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3">

        {visibleTabs.map((tab) => (

          <button

            key={tab}

            onClick={() => setActive(tab)}

            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${

              active === tab ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"

            }`}

          >

            {TAB_LABELS[tab]}

          </button>

        ))}

      </div>



      <div className="p-4">

        {active === "bookings" && (
          <BookingsList
            data={bookings}
            routerRefresh={router.refresh}
            onPrint={(booking) => setPrintBooking(booking)}
            canCreateBooking={canCreateBooking}
            canApprove={canApprove}
            vehicles={vehicles}
            drivers={drivers}
          />
        )}

        {active === "vehicles" && (

          <VehiclesList

            data={vehicles}

            drivers={drivers}

            onEdit={(vehicle) => {

              setVehicleModalMode("edit");

              setEditingVehicle(vehicle);

            }}

            onCreate={() => {

              setVehicleModalMode("create");

              setEditingVehicle({

                id: 0,

                licensePlate: "",

                brandModel: "",

                vehicleType: "",

                capacity: 0,

                status: "available",

                assignedDriverId: null,

                driver_name: "",

                driver_phone: "",

              });

            }}

            routerRefresh={router.refresh}

          />

        )}

        {active === "drivers" && (

          <DriversList

            data={drivers}

            onEdit={(driver) => {

              setDriverModalMode("edit");

              setEditingDriver(driver);

            }}

            onCreate={() => {

              setDriverModalMode("create");

              setEditingDriver({

                id: 0,

                name: "",

                phone: "",

                licenseNo: "",

                experienceYears: 0,

                status: "active",

              });

            }}

            routerRefresh={router.refresh}

          />

        )}

        {active === "users" && canViewUsers && (

          <UsersList

            data={users}

            onEdit={(user) => {

              setUserModalMode("edit");

              setEditingUser(user);

            }}

            onCreate={() => {

              setUserModalMode("create");

              setEditingUser({

                id: 0,

                username: "",

                fullName: "",

                role: "user",

                department: "",

                position: "",

                status: "active",

              });

            }}

            routerRefresh={router.refresh}

          />

        )}

      </div>



      {editingVehicle ? (

        <VehicleModal

          mode={vehicleModalMode}

          vehicle={editingVehicle}

          drivers={drivers}

          onClose={() => setEditingVehicle(null)}

          onSaved={() => {

            setEditingVehicle(null);

            setVehicleModalMode("edit");

            router.refresh();

          }}

        />

      ) : null}



      {editingDriver ? (

        <DriverModal

          mode={driverModalMode}

          driver={editingDriver}

          onClose={() => setEditingDriver(null)}

          onSaved={() => {

            setEditingDriver(null);

            setDriverModalMode("edit");

            router.refresh();

          }}

        />

      ) : null}



      {editingUser ? (
        <UserModal
          mode={userModalMode}
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => {
            setEditingUser(null);
            setUserModalMode("edit");
            router.refresh();
          }}
        />
      ) : null}


      {printBooking ? <PrintBookingModal booking={printBooking} onClose={() => setPrintBooking(null)} /> : null}

    </div>

  );

}



function BookingsList({
  data,
  routerRefresh,
  onPrint,
  canCreateBooking,
  canApprove,
  vehicles,
  drivers,
}: {
  data: Booking[];
  routerRefresh: () => void;
  onPrint: (booking: Booking) => void;
  canCreateBooking: boolean;
  canApprove: boolean;
  vehicles: Vehicle[];
  drivers: Driver[];
}) {

  const [loadingId, setLoadingId] = useState<number | null>(null);

  const updateStatus = async (id: number, status: Booking["status"]) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        throw new Error("อัปเดตสถานะไม่สำเร็จ");
      }
      routerRefresh();
    } catch (err) {
      console.error(err);
      alert("อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoadingId(null);
    }
  };


  const handleDelete = async (id: number) => {

    if (!confirm("ยืนยันการลบรายการนี้?")) return;

    setLoadingId(id);

    try {

      await fetch(`/api/bookings/${id}`, { method: "DELETE" });

      routerRefresh();

    } finally {

      setLoadingId(null);

    }

  };



  if (!data.length) {
    return <EmptyState text="ยังไม่มีรายการขอใช้รถ" />;
  }

  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-3">
      <ListHeader
        title="ข้อมูลการขอใช้รถล่าสุด"
        subtitle="ตรวจสอบ อนุมัติ หรือจัดการรายการขอใช้รถ"
        actions={
          canCreateBooking ? (
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              เพิ่มการขอใช้รถ
            </button>
          ) : undefined
        }
      />
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-slate-800">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">หมายเลขขอใช้รถ</th>
              <th className="px-4 py-3 font-semibold">จุดหมาย</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">ช่วงเวลา</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">ผู้โดยสาร</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">ยานพาหนะ</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">พนักงานขับรถ</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">ผู้ขอใช้รถ</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">สถานะ</th>
              <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">{booking.id}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-semibold text-slate-900">{booking.bookingCode}</div>
                  {booking.notes ? <div className="text-xs text-slate-500">{booking.notes}</div> : null}
                </td>
                <td className="px-4 py-3">{booking.destination}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDateTime(booking.startDatetime)} <br /> {formatDateTime(booking.endDatetime)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{booking.passengerCount ?? 0} คน</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {booking.license_plate ? `${booking.license_plate} (${booking.brand_model ?? "-"})` : "-"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{booking.driver_name ?? "-"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-semibold text-slate-900">{booking.requester_name ?? "-"}</div>
                  {booking.requester_department || booking.requester_position ? (
                    <div className="text-xs text-slate-500">
                      {booking.requester_department} {booking.requester_position}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge label={bookingStatusLabel(booking.status)} tone={bookingTone(booking.status)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-nowrap items-center justify-end gap-2 whitespace-nowrap">
                    {canApprove && booking.status === "pending" ? (
                      <>
                        <ActionButton
                          tone="green"
                          disabled={loadingId === booking.id}
                          onClick={() => updateStatus(booking.id, "approved")}
                          label="อนุมัติ"
                        />
                        <ActionButton
                          tone="amber"
                          disabled={loadingId === booking.id}
                          onClick={() => updateStatus(booking.id, "rejected")}
                          label="ปฏิเสธ"
                        />
                      </>
                    ) : null}
                    {canApprove && booking.status === "approved" ? (
                      <ActionButton
                        tone="blue"
                        disabled={loadingId === booking.id}
                        onClick={() => updateStatus(booking.id, "completed")}
                        label="เสร็จสิ้น"
                      />
                    ) : null}
                    {booking.status !== "completed" ? (
                      <ActionButton
                        tone="red"
                        disabled={loadingId === booking.id}
                        onClick={() => handleDelete(booking.id)}
                        label="ลบ"
                      />
                    ) : null}
                    <ActionButton tone="blue" onClick={() => onPrint(booking)} label="พิมพ์แบบ 3" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {createOpen ? (
        <NewBookingModal
          vehicles={vehicles}
          drivers={drivers}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            routerRefresh();
          }}
        />
      ) : null}
    </div>
  );
}




function NewBookingModal({
  vehicles,
  drivers,
  onClose,
  onSaved,
}: {
  vehicles: Vehicle[];
  drivers: Driver[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    vehicleId: "",
    driverId: "",
    passengerCount: "",
    startDatetime: "",
    endDatetime: "",
    destination: "",
    purpose: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.vehicleId || !form.startDatetime || !form.endDatetime || !form.destination) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: form.vehicleId || null,
          driver_id: form.driverId || null,
          passenger_count: form.passengerCount ? Number(form.passengerCount) : null,
          start_datetime: form.startDatetime,
          end_datetime: form.endDatetime,
          destination: form.destination,
          purpose: form.purpose,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "บันทึกคำขอใช้รถไม่สำเร็จ");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="ขอใช้รถใหม่" onClose={onClose}>
      <div className="space-y-4">
        {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
        <FormGrid>
          <LabeledSelect
            label="เลือกรถ"
            value={form.vehicleId}
            onChange={(e) => update("vehicleId", e.target.value)}
            options={[
              { value: "", label: "เลือกรถ" },
              ...vehicles.map((v) => ({ value: String(v.id), label: `${v.licensePlate} (${v.brandModel})` })),
            ]}
          />
          <LabeledSelect
            label="เลือกคนขับ (ถ้ามี)"
            value={form.driverId}
            onChange={(e) => update("driverId", e.target.value)}
            options={[
              { value: "", label: "ไม่ระบุพนักงานขับรถ" },
              ...drivers.map((d) => ({ value: String(d.id), label: d.name })),
            ]}
          />
        </FormGrid>
        <FormGrid>
          <LabeledInput
            label="จำนวน (คน)"
            value={form.passengerCount}
            onChange={(e) => update("passengerCount", e.target.value)}
            type="number"
            min={1}
            placeholder="0"
          />
          <LabeledInput
            label="วัน/เวลาเริ่มออกเดินทาง"
            value={form.startDatetime}
            onChange={(e) => update("startDatetime", e.target.value)}
            type="datetime-local"
          />
        </FormGrid>
        <LabeledInput
          label="วัน/เวลากลับถึง"
          value={form.endDatetime}
          onChange={(e) => update("endDatetime", e.target.value)}
          type="datetime-local"
        />
        <LabeledInput
          label="ปลายทาง"
          value={form.destination}
          onChange={(e) => update("destination", e.target.value)}
          placeholder="เช่น โรงพยาบาล / สถานที่ราชการ"
        />
        <LabeledTextarea
          label="วัตถุประสงค์"
          value={form.purpose}
          onChange={(e) => update("purpose", e.target.value)}
          rows={3}
        />
        <LabeledTextarea
          label="หมายเหตุ"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={2}
        />
      </div>
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSave}
        confirmLabel="บันทึกคำขอใช้รถ"
        confirmTone="blue"
        loading={saving}
      />
    </Modal>
  );
}

function VehiclesList({
  data,
  drivers,
  onEdit,
  onCreate,
  routerRefresh,

}: {

  data: Vehicle[];

  drivers: Driver[];

  onEdit: (vehicle: Vehicle) => void;

  onCreate: () => void;

  routerRefresh: () => void;

}) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("ต้องการลบข้อมูลรถหรือไม่?")) return;
    setLoadingId(id);
    try {
      await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      routerRefresh();
    } finally {
      setLoadingId(null);
    }
  };

  if (!data.length) {
    return <EmptyState text="ยังไม่มียานพาหนะ" />;
  }

  return (
    <>
      <ListHeader
        title="ข้อมูลยานพาหนะ"
        subtitle="ตรวจสอบสถานะรถและกำหนดพนักงานขับรถ"
        actions={
          <button
            onClick={onCreate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            เพิ่มยานพาหนะ
          </button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {data.map((vehicle) => (
          <div key={vehicle.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 pb-2">
              <div>
                <p className="text-sm text-slate-500">ทะเบียน</p>
                <p className="font-semibold text-slate-900">{vehicle.licensePlate}</p>
              </div>
              <StatusBadge label={vehicleStatusLabel(vehicle.status)} tone={vehicleTone(vehicle.status)} />
            </div>
            <div className="grid gap-2 text-sm text-slate-700">
              <DetailRow label="รุ่น/ยี่ห้อ" value={vehicle.brandModel} />
              <DetailRow label="ประเภท" value={vehicle.vehicleType} />
              <DetailRow label="จำนวนที่นั่ง" value={`${vehicle.capacity} ที่นั่ง`} />
              <DetailRow label="พนักงานขับรถ" value={vehicle.driver_name ?? "-"} hint={vehicle.driver_phone} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton tone="blue" onClick={() => onEdit(vehicle)} label="แก้ไข" />
              <ActionButton
                tone="red"
                disabled={loadingId === vehicle.id}
                onClick={() => handleDelete(vehicle.id)}
                label="ลบ"
              />
            </div>
          </div>
        ))}
      </div>
    </>

  );

}



function DriversList({
  data,
  onEdit,
  onCreate,
  routerRefresh,
}: {
  data: Driver[];
  onEdit: (driver: Driver) => void;
  onCreate: () => void;
  routerRefresh: () => void;
}) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบพนักงานขับรถนี้?")) return;
    setLoadingId(id);
    try {
      await fetch(`/api/drivers/${id}`, { method: "DELETE" });
      routerRefresh();
    } finally {
      setLoadingId(null);
    }
  };

  if (!data.length) {
    return <EmptyState text="ยังไม่มีพนักงานขับรถ" />;
  }

  return (
    <>
      <ListHeader
        title="พนักงานขับรถ"
        subtitle="อัปเดตข้อมูลหรือสถานะการปฏิบัติงาน"
        actions={
          <button
            onClick={onCreate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            เพิ่มพนักงานขับรถ
          </button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {data.map((driver) => (
          <div key={driver.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 pb-2">
              <div>
                <p className="text-sm text-slate-500">ชื่อ-สกุล</p>
                <p className="font-semibold text-slate-900">{driver.name}</p>
              </div>
              <StatusBadge label={driverStatusLabel(driver.status)} tone={driverTone(driver.status)} />
            </div>
            <div className="grid gap-2 text-sm text-slate-700">
              <DetailRow label="เบอร์โทร" value={driver.phone} />
              <DetailRow label="ใบขับขี่" value={driver.licenseNo} />
              <DetailRow label="ประสบการณ์" value={`${driver.experienceYears} ปี`} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <ActionButton tone="blue" onClick={() => onEdit(driver)} label="แก้ไข" />
              <ActionButton
                tone="red"
                disabled={loadingId === driver.id}
                onClick={() => handleDelete(driver.id)}
                label="ลบ"
              />
            </div>
          </div>
        ))}
      </div>

    </>
  );
}

function UsersList({
  data,
  onEdit,
  onCreate,
  routerRefresh,
}: {
  data: PublicUser[];
  onEdit: (user: PublicUser) => void;
  onCreate: () => void;
  routerRefresh: () => void;
}) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบบัญชีผู้ใช้งานนี้?")) return;
    setLoadingId(id);
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      routerRefresh();
    } finally {
      setLoadingId(null);
    }
  };

  if (!data.length) {
    return <EmptyState text="ยังไม่มีผู้ใช้งาน" />;
  }

  return (
    <div className="space-y-3">
      <ListHeader
        title="ผู้ใช้งานระบบ"
        subtitle="บริหารสิทธิ์การเข้าถึงและสถานะบัญชี"
        actions={
          <button
            onClick={onCreate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            เพิ่มผู้ใช้งาน
          </button>
        }
      />
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-slate-800">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">ชื่อผู้ใช้งาน</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">ชื่อ-สกุล</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">บทบาท</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">สถานะ</th>
              <th className="px-4 py-3 font-semibold">หน่วยงาน</th>
              <th className="px-4 py-3 font-semibold">ตำแหน่ง</th>
              <th className="px-4 py-3 font-semibold text-right whitespace-nowrap">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">{user.id}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-semibold text-slate-900">{user.username}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{user.fullName}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge label={userRoleLabel(user.role)} tone="blue" />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge label={userStatusLabel(user.status)} tone={userTone(user.status)} />
                </td>
                <td className="px-4 py-3">{user.department ?? "-"}</td>
                <td className="px-4 py-3">{user.position ?? "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <ActionButton tone="blue" onClick={() => onEdit(user)} label="แก้ไข" />
                    <ActionButton
                      tone="red"
                      disabled={loadingId === user.id}
                      onClick={() => handleDelete(user.id)}
                      label="ลบ"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VehicleModal({
  vehicle,
  drivers,
  mode = "edit",
  onClose,
  onSaved,

}: {

  vehicle: Vehicle;

  drivers: Driver[];

  mode?: "edit" | "create";

  onClose: () => void;

  onSaved: () => void;

}) {

  const [form, setForm] = useState({

    license_plate: vehicle.licensePlate,

    brand_model: vehicle.brandModel,

    vehicle_type: vehicle.vehicleType,

    capacity: vehicle.capacity.toString(),

    status: vehicle.status,

    assigned_driver_id: vehicle.assignedDriverId ? vehicle.assignedDriverId.toString() : "",

  });

  const [saving, setSaving] = useState(false);



  const handleSubmit = async () => {

    setSaving(true);

    try {

      const isCreate = mode === "create" || !vehicle.id;

      const url = isCreate ? `/api/vehicles` : `/api/vehicles/${vehicle.id}`;

      const method = isCreate ? "POST" : "PATCH";

      await fetch(url, {

        method,

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          ...form,

          capacity: Number(form.capacity),

          assigned_driver_id: form.assigned_driver_id ? Number(form.assigned_driver_id) : null,

        }),

      });

      onSaved();

    } finally {

      setSaving(false);

    }

  };



  return (
    <Modal title="แก้ไขยานพาหนะ" onClose={onClose}>
      <FormGrid>
        <LabeledInput
          label="ทะเบียน"
          value={form.license_plate}
          onChange={(e) => setForm((prev) => ({ ...prev, license_plate: e.target.value }))}
        />
        <LabeledInput
          label="รุ่น/ยี่ห้อ"
          value={form.brand_model}
          onChange={(e) => setForm((prev) => ({ ...prev, brand_model: e.target.value }))}
        />
        <LabeledInput
          label="ประเภท"
          value={form.vehicle_type}
          onChange={(e) => setForm((prev) => ({ ...prev, vehicle_type: e.target.value }))}
        />
        <LabeledInput
          label="จำนวนที่นั่ง"
          type="number"
          value={form.capacity}
          onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))}
        />
        <LabeledSelect
          label="สถานะ"
          value={form.status}
          onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Vehicle["status"] }))}
          options={[
            { value: "available", label: "พร้อมใช้งาน" },
            { value: "in_use", label: "กำลังใช้งาน" },
            { value: "maintenance", label: "ซ่อมบำรุง" },
          ]}
        />
        <LabeledSelect
          label="พนักงานขับรถ"
          value={form.assigned_driver_id}
          onChange={(e) => setForm((prev) => ({ ...prev, assigned_driver_id: e.target.value }))}
          options={[
            { value: "", label: "ไม่ระบุ" },
            ...drivers.map((driver) => ({ value: driver.id.toString(), label: driver.name })),
          ]}
        />
      </FormGrid>
      <ModalActions
        onCancel={onClose}
        onConfirm={handleSubmit}
        confirmLabel="บันทึก"
        confirmTone="blue"
        loading={saving}
      />
    </Modal>
  );
}


function DriverModal({
  driver,
  mode = "edit",
  onClose,
  onSaved,
}: {
  driver: Driver;
  mode?: "edit" | "create";
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: driver.name,
    phone: driver.phone,
    license_no: driver.licenseNo,
    experience_years: driver.experienceYears.toString(),
    status: driver.status,

  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const isCreate = mode === "create" || !driver.id;
      const url = isCreate ? `/api/drivers` : `/api/drivers/${driver.id}`;
      const method = isCreate ? "POST" : "PATCH";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          experience_years: Number(form.experience_years),
        }),
      });

      onSaved();

    } finally {

      setSaving(false);

    }

  };

  return (
    <Modal title="แก้ไขพนักงานขับรถ" onClose={onClose}>
      <FormGrid>

        <LabeledInput label="ชื่อ-สกุล" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />

        <LabeledInput label="เบอร์โทร" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />

        <LabeledInput

          label="ใบขับขี่"

          value={form.license_no}

          onChange={(e) => setForm((prev) => ({ ...prev, license_no: e.target.value }))}

        />

        <LabeledInput

          label="ประสบการณ์ (ปี)"

          type="number"

          value={form.experience_years}

          onChange={(e) => setForm((prev) => ({ ...prev, experience_years: e.target.value }))}

        />

        <LabeledSelect

          label="สถานะ"

          value={form.status}

          onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Driver["status"] }))}

          options={[

            { value: "active", label: "พร้อมปฏิบัติงาน" },

            { value: "inactive", label: "ไม่พร้อมปฏิบัติงาน" },

          ]}

        />

      </FormGrid>

      <ModalActions

        onCancel={onClose}

        onConfirm={handleSubmit}

        confirmLabel="บันทึก"

        confirmTone="blue"

        loading={saving}

      />

    </Modal>

  );

}



function UserModal({

  user,

  mode = "edit",

  onClose,

  onSaved,

}: {

  user: PublicUser;

  mode?: "edit" | "create";

  onClose: () => void;

  onSaved: () => void;

}) {

  const [form, setForm] = useState({

    username: user.username,

    full_name: user.fullName,

    role: user.role,

    department: user.department ?? "",

    position: user.position ?? "",

    status: user.status,

    password: "",

  });

  const [saving, setSaving] = useState(false);



  const handleSubmit = async () => {

    setSaving(true);

    try {

      const isCreate = mode === "create" || !user.id;

      const url = isCreate ? `/api/users` : `/api/users/${user.id}`;

      const method = isCreate ? "POST" : "PATCH";

      await fetch(url, {

        method,

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          ...form,

          department: form.department || null,

          position: form.position || null,

          password: form.password || undefined,

        }),

      });

      onSaved();

    } finally {

      setSaving(false);

    }

  };



  return (

    <Modal title="แก้ไขผู้ใช้งาน" onClose={onClose}>

      <FormGrid>

        <LabeledInput

          label="ชื่อผู้ใช้"

          value={form.username}

          onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}

        />

        <LabeledInput

          label="ชื่อ-สกุล"

          value={form.full_name}

          onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}

        />

        <LabeledSelect

          label="บทบาท"

          value={form.role}

          onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as PublicUser["role"] }))}

          options={[

            { value: "admin", label: "ผู้ดูแลระบบ" },

            { value: "approver", label: "ผู้อนุมัติ" },

            { value: "user", label: "ผู้ใช้งานทั่วไป" },

          ]}

        />

        <LabeledInput

          label="หน่วยงาน"

          value={form.department}

          onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}

        />

        <LabeledInput label="ตำแหน่ง" value={form.position} onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))} />

        <LabeledSelect

          label="สถานะ"

          value={form.status}

          onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as PublicUser["status"] }))}

          options={[

            { value: "active", label: "ใช้งาน" },

            { value: "inactive", label: "ปิดการใช้งาน" },

          ]}

        />

        <LabeledInput

          label="รหัสผ่านใหม่ (ถ้ามี)"

          type="password"

          value={form.password}

          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}

        />

      </FormGrid>

      <ModalActions

        onCancel={onClose}

        onConfirm={handleSubmit}

        confirmLabel="บันทึก"

        confirmTone="blue"

        loading={saving}

      />

    </Modal>

  );

}



function EmptyState({ text }: { text: string }) {

  return (

    <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">

      <div className="text-sm font-medium text-slate-700">{text}</div>

      <div className="text-xs text-slate-500">เพิ่มข้อมูลเพื่อเริ่มต้นใช้งาน</div>

    </div>

  );

}



function ListHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {

  return (

    <div className="flex items-center justify-between pb-3">

      <div>

        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

        <p className="text-sm text-slate-600">{subtitle}</p>

      </div>

      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}

    </div>

  );

}



function DetailRow({ label, value, hint }: { label: string; value: string; hint?: string | null }) {

  return (

    <div className="flex justify-between gap-4">

      <span className="text-slate-500">{label}</span>

      <span className="text-right font-medium text-slate-900">

        {value}

        {hint ? <span className="block text-xs font-normal text-slate-500">{hint}</span> : null}

      </span>

    </div>

  );

}



function StatusBadge({ label, tone }: { label: string; tone: "blue" | "amber" | "green" | "red" | "slate" }) {

  const toneMap: Record<typeof tone, string> = {

    blue: "bg-blue-100 text-blue-800",

    amber: "bg-amber-100 text-amber-800",

    green: "bg-emerald-100 text-emerald-800",

    red: "bg-rose-100 text-rose-800",

    slate: "bg-slate-100 text-slate-800",

  };



  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${toneMap[tone]}`}>{label}</span>;

}



function ActionButton({

  label,

  onClick,

  tone,

  disabled,

}: {

  label: string;

  onClick: () => void;

  tone: "blue" | "amber" | "green" | "red";

  disabled?: boolean;

}) {

  const colors: Record<typeof tone, string> = {

    blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",

    amber: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",

    green: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",

    red: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",

  };

  return (

    <button

      onClick={onClick}

      disabled={disabled}

      className={`rounded-lg border px-3 py-1 text-sm font-semibold transition ${colors[tone]} ${

        disabled ? "opacity-60" : ""

      }`}

    >

      {label}

    </button>

  );

}



function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">

          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>

          <button className="text-slate-500 hover:text-slate-700" onClick={onClose}>

            ✕

          </button>

        </div>

        <div className="max-h-[70vh] overflow-y-auto px-4 py-4">{children}</div>

      </div>

    </div>

  );

}



function ModalActions({

  onCancel,

  onConfirm,

  confirmLabel,

  confirmTone,

  loading,

}: {

  onCancel: () => void;

  onConfirm: () => void;

  confirmLabel: string;

  confirmTone: "blue" | "green" | "red";

  loading?: boolean;

}) {

  const toneClasses: Record<typeof confirmTone, string> = {

    blue: "bg-blue-600 hover:bg-blue-700",

    green: "bg-emerald-600 hover:bg-emerald-700",

    red: "bg-rose-600 hover:bg-rose-700",

  };

  return (

    <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">

      <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onCancel}>

        ยกเลิก

      </button>

      <button

        onClick={onConfirm}

        disabled={loading}

        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${toneClasses[confirmTone]} ${

          loading ? "opacity-60" : ""

        }`}

      >

        {loading ? "กำลังบันทึก..." : confirmLabel}

      </button>

    </div>

  );

}



function FormGrid({ children }: { children: ReactNode }) {

  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;

}



function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  min,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  min?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={onChange}
        type={type}
        min={min}
        placeholder={placeholder}
        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
      />
    </label>
  );
}



function LabeledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function LabeledTextarea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
      />
    </label>
  );
}
function formatDateTime(value: string | Date) {

  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("th-TH", {

    dateStyle: "medium",

    timeStyle: "short",

  }).format(date);

}



function bookingStatusLabel(status: Booking["status"]) {

  switch (status) {

    case "pending":

      return "รออนุมัติ";

    case "approved":

      return "อนุมัติแล้ว";

    case "rejected":

      return "ปฏิเสธ";

    case "completed":

      return "เสร็จสิ้น";

    case "cancelled":

      return "ยกเลิก";

    default:

      return status;

  }

}



function bookingTone(status: Booking["status"]): "blue" | "amber" | "green" | "red" | "slate" {

  switch (status) {

    case "pending":

      return "amber";

    case "approved":

      return "blue";

    case "completed":

      return "green";

    case "rejected":

    case "cancelled":

      return "red";

    default:

      return "slate";

  }

}



function vehicleStatusLabel(status: Vehicle["status"]) {

  switch (status) {

    case "available":

      return "พร้อมใช้งาน";

    case "in_use":

      return "กำลังใช้งาน";

    case "maintenance":

      return "ซ่อมบำรุง";

    default:

      return status;

  }

}



function vehicleTone(status: Vehicle["status"]): "blue" | "amber" | "green" | "red" | "slate" {

  switch (status) {

    case "available":

      return "green";

    case "in_use":

      return "blue";

    case "maintenance":

      return "amber";

    default:

      return "slate";

  }

}



function driverStatusLabel(status: Driver["status"]) {

  return status === "active" ? "พร้อมปฏิบัติงาน" : "ไม่พร้อม";

}



function driverTone(status: Driver["status"]): "blue" | "amber" | "green" | "red" | "slate" {

  return status === "active" ? "green" : "amber";

}



function userRoleLabel(role: PublicUser["role"]) {

  switch (role) {

    case "admin":

      return "ผู้ดูแลระบบ";

    case "approver":

      return "ผู้อนุมัติ";

    case "user":

      return "ผู้ใช้งาน";

    default:

      return role;

  }

}



function userStatusLabel(status: PublicUser["status"]) {

  return status === "active" ? "ใช้งาน" : "ปิดการใช้งาน";

}



function userTone(status: PublicUser["status"]): "blue" | "amber" | "green" | "red" | "slate" {

  return status === "active" ? "green" : "amber";

}



function PrintBookingModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {

  useEffect(() => {

    if (typeof document === "undefined") return;

    const html = document.documentElement;

    const body = document.body;

    html.classList.add("print-mode");

    body.classList.add("print-mode");

    return () => {

      html.classList.remove("print-mode");

      body.classList.remove("print-mode");

    };

  }, []);



  if (typeof document === "undefined") return null;



  const requestDate = formatThaiDate(booking.createdAt ?? new Date());

  const startDate = formatThaiDate(booking.startDatetime);

  const endDate = formatThaiDate(booking.endDatetime);

  const startTime = formatThaiTime(booking.startDatetime);

  const endTime = formatThaiTime(booking.endDatetime);

  const durationDays = diffDays(booking.startDatetime, booking.endDatetime);

  const passengerCount = booking.passengerCount ?? "";

  const purposeText = booking.purpose || booking.destination || "";

  const locationName = "สำนักงานสาธารณสุขจังหวัดอุบลราชธานี";

  const approverName = "นายแพทย์สาธารณสุขจังหวัดอุบลราชธานี";

  const requesterName = placeholder(booking.requester_name, "เจ้าหน้าที่ทั่วไป");

  const requesterPosition = placeholder(booking.requester_position, "N/A");

  const requesterDepartment = placeholder(booking.requester_department, "ฝ่ายบริการ");

  const licensePlate = placeholder(booking.license_plate, "........................");

  const purposeDisplay = placeholder(purposeText, "........................");

  const driverName = placeholder(booking.driver_name, "........................");

  const passengerDisplay = placeholder(passengerCount ? `${passengerCount}` : "", "......");

  const destinationDisplay = placeholder(booking.destination, "........................");

  const durationDisplay = placeholder(`${durationDays} วัน`, "........");



  return createPortal(

    <div className="print-root fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:static print:overflow-visible print:bg-white print:p-0">

      <div className="h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl print:h-auto print:max-w-full print:overflow-visible print:rounded-none print:shadow-none">

        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 print:hidden">

          <h3 className="text-lg font-semibold text-slate-900">แบบคำขอใช้รถ แบบ 3</h3>

          <div className="flex gap-2">

            <button

              className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"

              onClick={() => window.print()}

            >

              พิมพ์

            </button>

            <button

              className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"

              onClick={onClose}

            >

              ปิด

            </button>

          </div>

        </div>

        <div className="h-full overflow-y-auto bg-slate-50 p-6 print:h-auto print:overflow-visible print:bg-white print:p-0">

          <div className="print-page mx-auto max-w-4xl bg-white p-10 shadow-sm ring-1 ring-slate-200 print:max-w-[190mm] print:p-6 print:text-[13px] print:leading-6 print:shadow-none print:ring-0">

            <div className="text-right text-sm text-slate-600 print:text-xs">แบบที่ 3</div>

            <h1 className="mt-1 text-center text-2xl font-semibold text-slate-900 print:text-xl">ใบขออนุญาตใช้รถส่วนกลาง</h1>

            <div className="mt-6 space-y-4 text-base leading-8 text-slate-800 print:space-y-3 print:text-[13px] print:leading-6 print-block">

              <div className="flex flex-wrap justify-between gap-4">

                <div>

                  เขียนที่ <LineField widthClass="min-w-[240px]" align="left">{locationName}</LineField>

                </div>

                <div>

                  วันที่ <LineField widthClass="min-w-[220px]" align="left">{requestDate}</LineField>

                </div>

              </div>

              <div>

                เรียน <LineField widthClass="min-w-[260px]" align="left">{approverName}</LineField>

              </div>

              <div className="leading-9 print:leading-7">

                ข้าพเจ้า <LineField widthClass="min-w-[220px]" align="left">{requesterName}</LineField> ตำแหน่ง{" "}

                <LineField widthClass="min-w-[140px]" align="left">{requesterPosition}</LineField> สังกัด{" "}

                <LineField widthClass="min-w-[200px]" align="left">{requesterDepartment}</LineField> มีความประสงค์ขออนุญาตใช้รถส่วนกลาง

              </div>

              <div>

                หมายเลขทะเบียน <LineField widthClass="min-w-[200px]" align="left">{licensePlate}</LineField> เพื่อ{" "}

                <LineField widthClass="min-w-[220px]" align="left">{purposeDisplay}</LineField>

              </div>

              <div>

                โดยมี <LineField widthClass="min-w-[220px]" align="left">{driverName}</LineField> เป็นผู้ขับขี่ มีผู้โดยสารจำนวน{" "}

                <LineField widthClass="min-w-[120px]" align="center">{passengerDisplay}</LineField> คน

              </div>

              <div>

                ปลายทาง <LineField widthClass="min-w-[260px]" align="left">{destinationDisplay}</LineField>

              </div>

              <div>

                ในวันที่ <LineField widthClass="min-w-[200px]" align="left">{startDate}</LineField> เวลา{" "}

                <LineField widthClass="min-w-[120px]" align="center">{startTime}</LineField> น.

              </div>

              <div>

                ถึงวันที่ <LineField widthClass="min-w-[200px]" align="left">{endDate}</LineField> เวลา{" "}

                <LineField widthClass="min-w-[120px]" align="center">{endTime}</LineField> น. รวม{" "}

                <LineField widthClass="min-w-[140px]" align="center">{durationDisplay}</LineField>

              </div>

            </div>



            <div className="mt-12 space-y-12 text-center text-slate-800 print:mt-8 print:space-y-8 print:text-[13px] print:leading-6 print-block">

              <div className="border-t border-dotted border-slate-300 pt-10">

                <div className="text-base">( {requesterName} )</div>

                <div className="mt-2 text-sm">

                  ตำแหน่ง <LineField widthClass="min-w-[140px]" align="center">{requesterPosition}</LineField>

                </div>

                <div className="mt-1 text-sm font-semibold">ผู้ขออนุญาต</div>

              </div>



              <div>

                <div className="mb-4 h-px w-full border-b border-dotted border-slate-300" />

                <br/>

                <div className="text-base">( ................................................ )</div>

                <div className="text-sm">หัวหน้ากลุ่มงาน/หัวหน้าฝ่าย หรือผู้แทน</div>

                <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">

                  <span>

                    วันที่ <LineField widthClass="w-28" align="center"></LineField>

                  </span>

                  <span>

                    เดือน <LineField widthClass="w-28" align="center"></LineField>

                  </span>

                  <span>

                    พ.ศ. <LineField widthClass="w-28" align="center"></LineField>

                  </span>

                </div>

              </div>



              <div>

                <div className="mb-3 text-sm font-semibold">คำสั่งของผู้มีอำนาจใช้รถยนต์</div>

                <br/>

                <div className="mb-4 h-px w-full border-b border-dotted border-slate-300" />

                <br />

                <div className="text-base">( ................................................ )</div>

                <div className="text-sm">ผู้มีอำนาจ</div>

                <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">

                  <span>

                    วันที่ <LineField widthClass="w-28" align="center"></LineField>

                  </span>

                  <span>

                    เดือน <LineField widthClass="w-28" align="center"></LineField>

                  </span>

                  <span>

                    พ.ศ. <LineField widthClass="w-28" align="center"></LineField>

                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>,

    document.body,

  );

}



function LineField({
  children = null,
  widthClass = "min-w-[180px]",
  align = "center",
  className = "",
}: {
  children?: ReactNode;
  widthClass?: string;

  align?: "left" | "center" | "right";

  className?: string;

}) {

  const justify = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

  return (

    <span

      className={`inline-flex items-end border-b border-dotted border-slate-500 px-2 ${widthClass} ${justify} ${className}`}

    >

      {children}

    </span>

  );

}



function placeholder(value?: string | null, fallback = "................................................") {

  const text = typeof value === "string" ? value.trim() : "";

  return text ? text : fallback;

}



function formatThaiDate(value: string | Date) {

  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("th-TH", { dateStyle: "long" }).format(date);

}



function formatThaiTime(value: string | Date) {

  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("th-TH", { timeStyle: "short" }).format(date);

}



function diffDays(start: string | Date, end: string | Date) {

  const startDate = new Date(start);

  const endDate = new Date(end);

  const msPerDay = 1000 * 60 * 60 * 24;

  const raw = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / msPerDay) + 1);

  return raw;

}

