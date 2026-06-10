import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/database';
import User from './models/User.model';
import Property from './models/Property.model';
import Room from './models/Room.model';
import Contract from './models/Contract.model';
import UtilityReading from './models/UtilityReading.model';
import Invoice from './models/Invoice.model';
import Payment from './models/Payment.model';
import MaintenanceRequest from './models/MaintenanceRequest.model';

const PASSWORD = 'password123';

const now = new Date();
// Returns { month, year } for a month offset relative to the current month.
function period(offset: number): { month: number; year: number } {
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

async function seed(): Promise<void> {
  await connectDB();

  console.log('Xoá dữ liệu cũ...');
  await Promise.all([
    User.deleteMany({}),
    Property.deleteMany({}),
    Room.deleteMany({}),
    Contract.deleteMany({}),
    UtilityReading.deleteMany({}),
    Invoice.deleteMany({}),
    Payment.deleteMany({}),
    MaintenanceRequest.deleteMany({}),
  ]);

  // --- Tài khoản ---
  const landlord = await User.create({
    name: 'Bà chủ trọ',
    email: 'landlord@roomflow.vn',
    phone: '0901234567',
    password: PASSWORD,
    role: 'landlord',
  });

  const tenantSeeds = [
    { name: 'Nguyễn Văn An', email: 'tenant1@roomflow.vn', phone: '0911111111' },
    { name: 'Trần Thị Bình', email: 'tenant2@roomflow.vn', phone: '0922222222' },
    { name: 'Lê Hoàng Cường', email: 'tenant3@roomflow.vn', phone: '0933333333' },
    { name: 'Phạm Thị Dung', email: 'tenant4@roomflow.vn', phone: '0944444444' },
  ];
  const tenants = [];
  for (const t of tenantSeeds) {
    tenants.push(await User.create({ ...t, password: PASSWORD, role: 'tenant' }));
  }

  // --- Khu trọ ---
  const propA = await Property.create({
    name: 'Khu trọ Bình Thạnh',
    address: '123 Nguyễn Xí, Q. Bình Thạnh, TP.HCM',
    landlord: landlord._id,
    electricityPricePerKwh: 3500,
    waterPricePerM3: 15000,
  });
  const propB = await Property.create({
    name: 'Khu trọ Thủ Đức',
    address: '45 Võ Văn Ngân, TP. Thủ Đức, TP.HCM',
    landlord: landlord._id,
    electricityPricePerKwh: 4000,
    waterPricePerM3: 18000,
  });

  // --- Phòng ---
  const roomSeeds = [
    { property: propA, roomNumber: 'P101', floor: 1, area: 22, baseRent: 3500000 },
    { property: propA, roomNumber: 'P102', floor: 1, area: 20, baseRent: 3200000 },
    { property: propA, roomNumber: 'P103', floor: 1, area: 25, baseRent: 4000000 },
    { property: propA, roomNumber: 'P201', floor: 2, area: 20, baseRent: 3200000 },
    { property: propB, roomNumber: 'A01', floor: 1, area: 18, baseRent: 2800000 },
    { property: propB, roomNumber: 'A02', floor: 1, area: 24, baseRent: 3800000 },
  ];
  const rooms = [];
  for (const r of roomSeeds) {
    rooms.push(await Room.create({ ...r, property: r.property._id, status: 'vacant' }));
  }

  // --- Hợp đồng: gắn 3 khách vào 3 phòng (các phòng còn lại để trống để demo) ---
  const assignments = [
    { tenant: tenants[0], room: rooms[0] }, // An -> P101
    { tenant: tenants[1], room: rooms[1] }, // Bình -> P102
    { tenant: tenants[2], room: rooms[4] }, // Cường -> A01
  ];
  const contracts = [];
  for (const a of assignments) {
    const c = await Contract.create({
      room: a.room._id,
      tenant: a.tenant._id,
      startDate: new Date(now.getFullYear(), 0, 1),
      endDate: new Date(now.getFullYear(), 11, 31),
      rentPrice: a.room.baseRent,
      deposit: a.room.baseRent,
      status: 'active',
    });
    await Room.findByIdAndUpdate(a.room._id, { status: 'occupied' });
    contracts.push(c);
  }

  // --- Chỉ số điện/nước + hóa đơn cho 4 tháng gần nhất ---
  const periods = [period(-3), period(-2), period(-1), period(0)];
  const monthlyUse = [
    { elec: 95, water: 9 }, // An
    { elec: 78, water: 7 }, // Bình
    { elec: 120, water: 11 }, // Cường
  ];

  let invoiceCount = 0;
  let paymentCount = 0;

  for (let ci = 0; ci < contracts.length; ci++) {
    const contract = contracts[ci];
    const room = assignments[ci].room;
    const tenant = assignments[ci].tenant;
    const use = monthlyUse[ci];
    let elecMeter = 100 + ci * 50;
    let waterMeter = 10 + ci * 5;

    for (let pi = 0; pi < periods.length; pi++) {
      const { month, year } = periods[pi];
      const electricityOld = elecMeter;
      const electricityNew = elecMeter + use.elec;
      const waterOld = waterMeter;
      const waterNew = waterMeter + use.water;
      elecMeter = electricityNew;
      waterMeter = waterNew;

      // pre-save hook tự tính electricityUsed/waterUsed/cost theo giá của property
      const reading = await UtilityReading.create({
        room: room._id,
        month,
        year,
        electricityOld,
        electricityNew,
        waterOld,
        waterNew,
      });

      const isCurrent = pi === periods.length - 1;
      // Tháng hiện tại: mỗi khách 1 trạng thái khác nhau (paid/pending/overdue) để demo
      let status: 'paid' | 'pending' | 'overdue';
      if (isCurrent) {
        status = (['paid', 'pending', 'overdue'] as const)[ci % 3];
      } else {
        status = 'paid';
      }

      const totalAmount = contract.rentPrice + reading.electricityCost + reading.waterCost;
      const dueDate = new Date(year, month - 1, 15);

      const invoice = await Invoice.create({
        room: room._id,
        contract: contract._id,
        tenant: tenant._id,
        month,
        year,
        rentAmount: contract.rentPrice,
        electricityCost: reading.electricityCost,
        waterCost: reading.waterCost,
        otherFees: 0,
        totalAmount,
        status,
        dueDate,
        paidAt: status === 'paid' ? new Date(year, month - 1, 10) : undefined,
        utilityReading: reading._id,
      });
      invoiceCount++;

      if (status === 'paid') {
        await Payment.create({
          invoice: invoice._id,
          amount: totalAmount,
          method: (['cash', 'bank_transfer', 'momo'] as const)[pi % 3],
          collectedBy: landlord._id,
          paidAt: new Date(year, month - 1, 10),
        });
        paymentCount++;
      }
    }
  }

  // --- Yêu cầu sửa chữa ---
  await MaintenanceRequest.create([
    {
      room: rooms[0]._id,
      tenant: tenants[0]._id,
      title: 'Vòi nước nhà tắm bị rỉ',
      description: 'Vòi nước chảy liên tục không khoá được, mong chủ trọ sửa sớm.',
      priority: 'high',
      status: 'pending',
      images: [],
    },
    {
      room: rooms[1]._id,
      tenant: tenants[1]._id,
      title: 'Bóng đèn phòng khách hỏng',
      description: 'Bóng đèn không sáng, cần thay mới.',
      priority: 'medium',
      status: 'in_progress',
      images: [],
    },
    {
      room: rooms[4]._id,
      tenant: tenants[2]._id,
      title: 'Điều hoà không mát',
      description: 'Máy lạnh chạy nhưng không mát, có thể hết gas.',
      priority: 'low',
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedNote: 'Đã nạp gas và vệ sinh máy lạnh.',
      images: [],
    },
  ]);

  console.log('\n===== SEED HOÀN TẤT =====');
  console.log(`Khu trọ:        ${await Property.countDocuments()}`);
  console.log(`Phòng:          ${await Room.countDocuments()} (3 đang thuê, 3 trống)`);
  console.log(`Hợp đồng:       ${contracts.length}`);
  console.log(`Chỉ số ĐN:      ${await UtilityReading.countDocuments()}`);
  console.log(`Hóa đơn:        ${invoiceCount}`);
  console.log(`Thanh toán:     ${paymentCount}`);
  console.log(`Sửa chữa:       ${await MaintenanceRequest.countDocuments()}`);
  console.log('\n--- Tài khoản demo (mật khẩu: password123) ---');
  console.log('Bà chủ (web):   landlord@roomflow.vn');
  tenantSeeds.forEach((t) => console.log(`Sinh viên:      ${t.email}  (${t.name})`));
  console.log('==========================\n');

  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed thất bại:', err);
    process.exit(1);
  });
