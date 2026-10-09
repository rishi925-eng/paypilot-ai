import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PayPilot AI Database...");

  // Clean existing records in correct relation order
  await prisma.inventoryEvent.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.paymentAttempt.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.product.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create Users (Customer & Merchant)
  const adminUser = await prisma.user.create({
    data: {
      email: "merchant@paypilot.io",
      name: "Rishi (Merchant Admin)",
      passwordHash: "demo_hash_admin_123",
      role: "MERCHANT",
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: "buyer@paypilot.io",
      name: "Alex Customer",
      passwordHash: "demo_hash_buyer_123",
      role: "CUSTOMER",
    },
  });

  console.log("👤 Created sample users: Merchant & Customer");

  // Sample Products with rich attributes
  const products = [
    {
      name: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
      slug: "sony-wh-1000xm5",
      description: "Industry-leading noise cancellation with two processors and 8 microphones. Up to 30-hour battery life with ultra-comfortable lightweight design, perfect for coding and long flights.",
      category: "Audio",
      price: 349.99,
      currency: "USD",
      stock: 25,
      imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 1420,
      attributes: [
        { name: "Battery Life", value: "30 Hours" },
        { name: "Noise Cancellation", value: "Active (ANC) with 8 mics" },
        { name: "Connectivity", value: "Bluetooth 5.2, Multipoint" },
        { name: "Weight", value: "250g" },
        { name: "Use Case", value: "Coding, Travel, Calls" },
      ],
    },
    {
      name: "Bose QuietComfort 45 Bluetooth Headphones",
      slug: "bose-qc45",
      description: "Iconic quiet, comfort, and sound. High-fidelity audio with proprietary TriPort acoustic architecture and Quiet/Aware Modes for all-day focus.",
      category: "Audio",
      price: 279.00,
      currency: "USD",
      stock: 18,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 980,
      attributes: [
        { name: "Battery Life", value: "24 Hours" },
        { name: "Noise Cancellation", value: "Active (Quiet / Aware modes)" },
        { name: "Connectivity", value: "Bluetooth 5.1" },
        { name: "Weight", value: "240g" },
        { name: "Use Case", value: "Travel, Daily Commute" },
      ],
    },
    {
      name: "Anker Soundcore Life Q30 Hybrid ANC Headphones",
      slug: "anker-soundcore-q30",
      description: "High-resolution certified sound with custom EQ via app, 40-hour ANC playtime, and ultra-plush memory foam earcups at an unbeatable value.",
      category: "Audio",
      price: 79.99,
      currency: "USD",
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
      rating: 4.6,
      reviewCount: 3100,
      attributes: [
        { name: "Battery Life", value: "40 Hours (ANC On) / 60 Hours (Standard)" },
        { name: "Noise Cancellation", value: "Hybrid Active (3 Modes)" },
        { name: "Connectivity", value: "Bluetooth 5.0, AUX" },
        { name: "Weight", value: "260g" },
        { name: "Use Case", value: "Budget, Study, Remote Work" },
      ],
    },
    {
      name: "Audio-Technica ATH-M50x Professional Studio Monitor Headphones",
      slug: "ath-m50x",
      description: "Critically acclaimed sonic performance praised by top audio engineers and pro audio reviewers. Exceptional clarity throughout an extended frequency range.",
      category: "Audio",
      price: 149.00,
      currency: "USD",
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewCount: 4200,
      attributes: [
        { name: "Battery Life", value: "Wired (Zero Latency)" },
        { name: "Noise Cancellation", value: "Passive Noise Isolation" },
        { name: "Connectivity", value: "Detachable 3.5mm / 6.3mm cables" },
        { name: "Driver Size", value: "45mm Large-aperture" },
        { name: "Use Case", value: "Music Production, Podcasting, Editing" },
      ],
    },
    {
      name: "Logitech MX Master 3S Wireless Performance Mouse",
      slug: "logitech-mx-master-3s",
      description: "Quiet clicks and 8K DPI any-surface tracking sensor. MagSpeed electromagnetic scrolling delivers 1,000 lines per second precision.",
      category: "Accessories",
      price: 99.99,
      currency: "USD",
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewCount: 2150,
      attributes: [
        { name: "Sensor", value: "8000 DPI Darkfield" },
        { name: "Battery", value: "Up to 70 Days per charge" },
        { name: "Connectivity", value: "Bluetooth, Logi Bolt USB" },
        { name: "Customization", value: "7 customizable buttons" },
        { name: "Use Case", value: "Productivity, Coding, Design" },
      ],
    },
    {
      name: "Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
      slug: "keychron-q1-pro",
      description: "Full aluminum 75% layout keyboard with hot-swappable switches, double-gasket design, and QMK/VIA programmable firmware.",
      category: "Accessories",
      price: 199.00,
      currency: "USD",
      stock: 12,
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 640,
      attributes: [
        { name: "Layout", value: "75% Compact" },
        { name: "Switches", value: "K Pro Red (Hot-swappable)" },
        { name: "Body", value: "Full CNC Machined Aluminum" },
        { name: "Connectivity", value: "Bluetooth 5.1 & Type-C Wired" },
        { name: "Use Case", value: "Typing, Development, Mac & Windows" },
      ],
    },
    {
      name: "LG UltraFine 27-inch 4K UHD IPS Monitor (27UN850-W)",
      slug: "lg-ultrafine-27-4k",
      description: "3840 x 2160 UHD IPS Display with HDR400, sRGB 99% color gamut, USB-C 60W power delivery, and ergonomic height-adjustable stand.",
      category: "Monitors",
      price: 449.99,
      currency: "USD",
      stock: 8,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 890,
      attributes: [
        { name: "Resolution", value: "4K UHD (3840 x 2160)" },
        { name: "Panel Type", value: "IPS with HDR400" },
        { name: "Ports", value: "USB-C (60W PD), 2x HDMI, DisplayPort" },
        { name: "Refresh Rate", value: "60Hz FreeSync" },
        { name: "Use Case", value: "Software Engineering, Creative Work" },
      ],
    },
    {
      name: "Peak Design Everyday Backpack 20L (V2)",
      slug: "peak-design-everyday-backpack-20l",
      description: "An iconic, award-winning pack for everyday and photo carry. Weatherproof 100% recycled 400D nylon canvas with MagLatch hardware and FlexFold dividers.",
      category: "Travel & Bags",
      price: 279.95,
      currency: "USD",
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewCount: 520,
      attributes: [
        { name: "Capacity", value: "20 Liters" },
        { name: "Laptop Carry", value: "Holds up to 16\" MacBook Pro" },
        { name: "Material", value: "Weatherproof 400D Double Poly-Coated Canvas" },
        { name: "Hardware", value: "Anodized Aluminum MagLatch" },
        { name: "Use Case", value: "Tech Travel, Commute, Photography" },
      ],
    },
    {
      name: "Anker 737 Power Bank (PowerCore 24K 140W)",
      slug: "anker-737-power-bank",
      description: "Equipped with Power Delivery 3.1 and bi-directional technology to quickly recharge the portable charger or get a 140W ultra-powerful charge for your laptop.",
      category: "Accessories",
      price: 139.99,
      currency: "USD",
      stock: 22,
      imageUrl: "https://images.unsplash.com/photo-1609592424361-b4f009e44ffc?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 1100,
      attributes: [
        { name: "Capacity", value: "24,000 mAh" },
        { name: "Max Output", value: "140W Fast Charging" },
        { name: "Display", value: "Smart Digital Display with stats" },
        { name: "Ports", value: "2x USB-C, 1x USB-A" },
        { name: "Use Case", value: "Laptop & Phone Fast Charging on the Go" },
      ],
    }
  ];

  for (const item of products) {
    const { attributes, ...prodData } = item;
    const createdProduct = await prisma.product.create({
      data: prodData,
    });

    for (const attr of attributes) {
      await prisma.productAttribute.create({
        data: {
          productId: createdProduct.id,
          name: attr.name,
          value: attr.value,
        },
      });
    }

    // Seed inventory creation event
    await prisma.inventoryEvent.create({
      data: {
        productId: createdProduct.id,
        changeAmount: item.stock,
        reason: "INITIAL_SEED",
        referenceId: "SEED_INIT",
      },
    });
  }

  console.log(`📦 Successfully seeded ${products.length} products with attributes and inventory.`);

  // Create a sample completed order for merchant dashboard initial stats
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      userId: customerUser.id,
      customerName: customerUser.name,
      customerEmail: customerUser.email,
      status: "COMPLETED",
      subtotal: 449.98,
      tax: 36.00,
      shipping: 0.00,
      total: 485.98,
      currency: "USD",
      shippingAddress: JSON.stringify({
        fullName: "Alex Customer",
        addressLine1: "123 Innovation Way",
        city: "San Jose",
        state: "CA",
        postalCode: "95131",
        countryCode: "US",
      }),
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { slug: "sony-wh-1000xm5" } }))!.id,
            productName: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
            quantity: 1,
            unitPrice: 349.99,
            lineTotal: 349.99,
          },
          {
            productId: (await prisma.product.findFirst({ where: { slug: "logitech-mx-master-3s" } }))!.id,
            productName: "Logitech MX Master 3S Wireless Performance Mouse",
            quantity: 1,
            unitPrice: 99.99,
            lineTotal: 99.99,
          },
        ],
      },
      payments: {
        create: {
          paypalOrderId: "PAYPAL-SANDBOX-SAMPLE-ORD-01",
          paypalCaptureId: "CAPTURE-SANDBOX-SAMPLE-01",
          amount: 485.98,
          currency: "USD",
          status: "COMPLETED",
          payerEmail: "buyer-sandbox@paypilot.io",
          payerId: "SANDBOX_PAYER_123",
          rawResponse: JSON.stringify({ status: "COMPLETED", source: "SEED_DATA" }),
        },
      },
      auditEvents: {
        create: [
          {
            entityType: "ORDER",
            entityId: "ORD-SAMPLE",
            action: "CREATE",
            performedBy: "CUSTOMER:" + customerUser.id,
          },
          {
            entityType: "PAYMENT",
            entityId: "CAPTURE-SANDBOX-SAMPLE-01",
            action: "CAPTURE",
            performedBy: "PAYPAL_API",
          },
        ],
      },
    },
  });

  console.log(`✅ Seeded sample completed order ${sampleOrder.orderNumber} for instant merchant metrics!`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
