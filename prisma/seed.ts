import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PayPilot AI Database — 30 products across 8 categories...");

  // ─── Clean existing records in correct relation order ───────────────────────
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

  // ─── Users ──────────────────────────────────────────────────────────────────
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

  const customer2 = await prisma.user.create({
    data: {
      email: "jane.doe@example.com",
      name: "Jane Doe",
      passwordHash: "demo_hash_jane_456",
      role: "CUSTOMER",
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      email: "mark.chen@example.com",
      name: "Mark Chen",
      passwordHash: "demo_hash_mark_789",
      role: "CUSTOMER",
    },
  });

  console.log("👤 Created 4 sample users: 1 Merchant + 3 Customers");

  // ─── Product Definitions ────────────────────────────────────────────────────
  const products = [
    // ── CATEGORY: Audio (5 products) ─────────────────────────────────────────
    {
      name: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
      slug: "sony-wh-1000xm5",
      description:
        "Industry-leading noise cancellation powered by two processors and 8 microphones. The WH-1000XM5 delivers crystal-clear hands-free calling, Multipoint connection to two devices simultaneously, and up to 30-hour battery life. Lightweight at just 250g with soft-fit leather earcups for all-day comfort during coding sessions, flights, and remote work.",
      category: "Audio",
      price: 349.99,
      currency: "USD",
      stock: 25,
      imageUrl:
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 1420,
      attributes: [
        { name: "Battery Life", value: "30 Hours (ANC On)" },
        { name: "Noise Cancellation", value: "Active ANC — Dual Processor + 8 Mics" },
        { name: "Connectivity", value: "Bluetooth 5.2, Multipoint (2 devices)" },
        { name: "Weight", value: "250g" },
        { name: "Use Case", value: "Coding, Travel, Video Calls" },
      ],
    },
    {
      name: "Bose QuietComfort 45 Bluetooth Headphones",
      slug: "bose-qc45",
      description:
        "Iconic Bose quiet, comfort, and sound quality refined over decades. Proprietary TriPort acoustic architecture paired with Active EQ delivers high-fidelity balanced audio. Switch between Quiet Mode (full ANC) and Aware Mode (hear your environment) with a single button tap. USB-C charging and 24-hour battery make these the go-to travel companion.",
      category: "Audio",
      price: 279.0,
      currency: "USD",
      stock: 18,
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 980,
      attributes: [
        { name: "Battery Life", value: "24 Hours (ANC On)" },
        { name: "Noise Cancellation", value: "Active ANC — Quiet & Aware Modes" },
        { name: "Connectivity", value: "Bluetooth 5.1, NFC Pairing" },
        { name: "Weight", value: "240g" },
        { name: "Use Case", value: "Travel, Daily Commute, Calls" },
      ],
    },
    {
      name: "Anker Soundcore Life Q30 Hybrid ANC Headphones",
      slug: "anker-soundcore-q30",
      description:
        "High-resolution audio certified headphones with custom EQ tuning via the Soundcore app. Hybrid active noise cancellation uses both external and internal microphones to block out up to 95% of ambient noise. Enjoy 40 hours of playtime with ANC enabled and 60 hours without. Ultra-plush memory foam earcups ensure listening comfort for hours.",
      category: "Audio",
      price: 79.99,
      currency: "USD",
      stock: 45,
      imageUrl:
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
      rating: 4.6,
      reviewCount: 3100,
      attributes: [
        { name: "Battery Life", value: "40 Hours ANC On / 60 Hours Standard" },
        { name: "Noise Cancellation", value: "Hybrid ANC — 3 Environment Modes" },
        { name: "Connectivity", value: "Bluetooth 5.0, 3.5mm AUX" },
        { name: "Weight", value: "260g" },
        { name: "Use Case", value: "Budget Pick, Study, Remote Work" },
      ],
    },
    {
      name: "Audio-Technica ATH-M50x Professional Studio Monitor Headphones",
      slug: "ath-m50x",
      description:
        "Critically acclaimed by top audio engineers and professional audio reviewers worldwide, the ATH-M50x delivers exceptional clarity across an extended frequency range (15–28,000 Hz). 45mm large-aperture drivers with rare earth magnets and copper-clad aluminum wire voice coils provide incredibly accurate sound reproduction. Three interchangeable cables included.",
      category: "Audio",
      price: 149.0,
      currency: "USD",
      stock: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewCount: 4200,
      attributes: [
        { name: "Driver Size", value: "45mm Large-Aperture" },
        { name: "Frequency Response", value: "15 Hz – 28,000 Hz" },
        { name: "Connectivity", value: "3x Detachable Cables (3.5mm & 6.3mm adapter)" },
        { name: "Noise Isolation", value: "Passive Circumaural Isolation" },
        { name: "Use Case", value: "Music Production, Podcasting, Post-Editing" },
      ],
    },
    {
      name: "Jabra Evolve2 85 ANC Wireless Headset",
      slug: "jabra-evolve2-85",
      description:
        "Professional-grade wireless headset engineered for the modern open office. Features 10-microphone call technology with Advanced Active Noise Cancellation to focus on calls in any environment. Certified for Microsoft Teams, Zoom, and UC platforms. 37-hour battery, Jabra Air Comfort earcushions, and a dedicated busy light make this the ultimate WFH tool.",
      category: "Audio",
      price: 379.0,
      currency: "USD",
      stock: 10,
      imageUrl:
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 610,
      attributes: [
        { name: "Battery Life", value: "37 Hours (ANC On)" },
        { name: "Microphones", value: "10-Mic Array for Calls" },
        { name: "Connectivity", value: "Bluetooth 5.0, USB-A/C Dongle" },
        { name: "Certifications", value: "Microsoft Teams & Zoom Certified" },
        { name: "Use Case", value: "Remote Work, Open Office, Video Conferencing" },
      ],
    },

    // ── CATEGORY: Accessories (5 products) ───────────────────────────────────
    {
      name: "Logitech MX Master 3S Wireless Performance Mouse",
      slug: "logitech-mx-master-3s",
      description:
        "Whisper-quiet clicks with the industry's most precise cursor—an 8K DPI any-surface sensor that works even on glass. MagSpeed electromagnetic scrolling propels through 1,000 lines per second with pixel-level precision. Ergonomic form factor with customizable button mapping via Logi Options+ software. Connects to up to 3 devices simultaneously.",
      category: "Accessories",
      price: 99.99,
      currency: "USD",
      stock: 40,
      imageUrl:
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewCount: 2150,
      attributes: [
        { name: "Sensor", value: "8000 DPI Darkfield — Works on Glass" },
        { name: "Battery", value: "Up to 70 Days per Full Charge" },
        { name: "Connectivity", value: "Bluetooth & Logi Bolt USB Receiver" },
        { name: "Buttons", value: "7 Fully Customizable Buttons" },
        { name: "Use Case", value: "Productivity, Coding, Creative Design" },
      ],
    },
    {
      name: "Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
      slug: "keychron-q1-pro",
      description:
        "The Q1 Pro is the fully-wireless evolution of Keychron's beloved Q1. Full CNC-machined aluminum frame with a double-gasket design dramatically reduces typing noise and vibration. Ships with hot-swappable K Pro Red switches, and the QMK/VIA open-source firmware lets you remap every key and create custom macros. Works on Mac and Windows.",
      category: "Accessories",
      price: 199.0,
      currency: "USD",
      stock: 12,
      imageUrl:
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 640,
      attributes: [
        { name: "Layout", value: "75% Compact (84 Keys)" },
        { name: "Switches", value: "Keychron K Pro Red (Hot-Swappable)" },
        { name: "Frame", value: "Full CNC Machined Aluminum + Double Gasket" },
        { name: "Connectivity", value: "Bluetooth 5.1 & USB-C Wired" },
        { name: "Firmware", value: "QMK / VIA Programmable" },
      ],
    },
    {
      name: "Anker 737 Power Bank (PowerCore 24K 140W)",
      slug: "anker-737-power-bank",
      description:
        "The Anker 737 leverages Power Delivery 3.1 to deliver up to 140W of output—powerful enough to fast-charge a MacBook Pro 14\". Bi-directional USB-C technology means it can recharge itself at 65W simultaneously while charging two other devices. A built-in smart display shows battery percentage, wattage, and time-to-full in real time. TSA-compliant.",
      category: "Accessories",
      price: 139.99,
      currency: "USD",
      stock: 22,
      imageUrl:
        "https://images.unsplash.com/photo-1609592424361-b4f009e44ffc?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 1100,
      attributes: [
        { name: "Capacity", value: "24,000 mAh" },
        { name: "Max Output", value: "140W PD 3.1 Fast Charging" },
        { name: "Ports", value: "2x USB-C + 1x USB-A" },
        { name: "Display", value: "Smart Digital Display (%, W, Time-to-Full)" },
        { name: "Use Case", value: "Laptop + Dual Phone Charging on the Go" },
      ],
    },
    {
      name: "Belkin BoostCharge Pro 3-in-1 MagSafe Charger",
      slug: "belkin-3-in-1-magsafe",
      description:
        "Certified by Apple, this 3-in-1 MagSafe charging pad simultaneously charges your iPhone at full 15W MagSafe speed, Apple Watch via its built-in magnetic puck, and AirPods wirelessly. The sleek articulating arm lets you prop your iPhone in landscape for StandBy mode. A single USB-C cable connects to its included 30W adapter—one cable, zero clutter.",
      category: "Accessories",
      price: 149.99,
      currency: "USD",
      stock: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1583394293214-0ef9f24f0b41?auto=format&fit=crop&w=800&q=80",
      rating: 4.6,
      reviewCount: 870,
      attributes: [
        { name: "iPhone Charging", value: "15W MagSafe (Apple Certified)" },
        { name: "Apple Watch", value: "Magnetic Fast Charging (Built-in Puck)" },
        { name: "AirPods Pad", value: "Qi Wireless Charging" },
        { name: "Adapter", value: "30W USB-C Included" },
        { name: "Use Case", value: "Apple Ecosystem Desk Setup, StandBy Mode" },
      ],
    },
    {
      name: "CalDigit TS4 Thunderbolt 4 Dock",
      slug: "caldigit-ts4-thunderbolt-dock",
      description:
        "The CalDigit TS4 is the world's most connected Thunderbolt 4 dock with 18 ports including 2x Thunderbolt 4 downstream (40 Gbps), 3x USB-A 3.2 Gen 2 (10 Gbps), 5x USB-A 2.0, 2.5 GbE LAN, SD 4.0 UHS-II card reader, 3.5mm audio in/out, and a DisplayPort 1.4. Delivers 98W of host charging. Single cable transforms your laptop into a full workstation.",
      category: "Accessories",
      price: 399.99,
      currency: "USD",
      stock: 7,
      imageUrl:
        "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 430,
      attributes: [
        { name: "Total Ports", value: "18 Ports" },
        { name: "Thunderbolt 4", value: "2x Downstream @ 40 Gbps" },
        { name: "Charging", value: "98W Host Charging via Single Cable" },
        { name: "Networking", value: "2.5 GbE Ethernet" },
        { name: "Use Case", value: "Single-Cable Pro Workstation, Dual 4K Monitors" },
      ],
    },

    // ── CATEGORY: Monitors (4 products) ──────────────────────────────────────
    {
      name: "LG UltraFine 27-inch 4K UHD IPS Monitor (27UN850-W)",
      slug: "lg-ultrafine-27-4k",
      description:
        "Stunning 3840×2160 UHD IPS display with VESA DisplayHDR400, 99% sRGB coverage, and factory calibration at Delta E < 2. The integrated Ergo Stand provides tilt, swivel, pivot, and height adjustment in a single arm. Built-in USB-C with 60W Power Delivery means one cable connects your laptop, charges it, and delivers video simultaneously.",
      category: "Monitors",
      price: 449.99,
      currency: "USD",
      stock: 8,
      imageUrl:
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 890,
      attributes: [
        { name: "Resolution", value: "4K UHD (3840 × 2160)" },
        { name: "Panel", value: "IPS, HDR400, 99% sRGB, ΔE < 2" },
        { name: "Ports", value: "USB-C 60W PD, 2× HDMI 2.0, DisplayPort 1.4, 3× USB-A" },
        { name: "Refresh Rate", value: "60Hz, AMD FreeSync" },
        { name: "Use Case", value: "Software Engineering, Content Creation, Color Work" },
      ],
    },
    {
      name: "Dell UltraSharp U2722D 27-inch QHD Monitor",
      slug: "dell-ultrasharp-u2722d",
      description:
        "Dell's U2722D features a 27-inch QHD (2560×1440) IPS Black panel with 2000:1 contrast ratio—significantly deeper blacks than standard IPS. Covers 100% sRGB and 100% Rec. 709 with factory calibration at ΔE < 2. A single Thunderbolt 4 port delivers video in and out, 90W device charging, and daisy-chaining to a second monitor.",
      category: "Monitors",
      price: 549.99,
      currency: "USD",
      stock: 11,
      imageUrl:
        "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 1130,
      attributes: [
        { name: "Resolution", value: "QHD (2560 × 1440)" },
        { name: "Panel", value: "IPS Black — 2000:1 Contrast, 100% sRGB" },
        { name: "Ports", value: "Thunderbolt 4 (90W PD + Daisy Chain), USB-C, HDMI 2.0, DP 1.4" },
        { name: "Ergonomics", value: "Height, Tilt, Swivel, Pivot Adjustable" },
        { name: "Use Case", value: "Developer Workstation, Dual-Monitor Setup" },
      ],
    },
    {
      name: "Samsung Odyssey G7 32-inch Curved WQHD Gaming Monitor",
      slug: "samsung-odyssey-g7-32",
      description:
        "Dominate every frame with the 32-inch Odyssey G7's 1000R immersive curve, WQHD (2560×1440) VA panel, 240Hz refresh rate, and 1ms response time. NVIDIA G-Sync Compatible and AMD FreeSync Premium Pro eliminate tearing and stutter. VESA DisplayHDR 600 with local dimming delivers vivid contrast. Ideal for both competitive gaming and creative work.",
      category: "Monitors",
      price: 649.99,
      currency: "USD",
      stock: 9,
      imageUrl:
        "https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 1560,
      attributes: [
        { name: "Resolution", value: "WQHD (2560 × 1440), 1000R Curve" },
        { name: "Panel", value: "VA — 240Hz, 1ms, HDR600 Local Dimming" },
        { name: "Sync", value: "NVIDIA G-Sync Compatible + AMD FreeSync Premium Pro" },
        { name: "Ports", value: "2× HDMI 2.0, DisplayPort 1.4, 2× USB-A" },
        { name: "Use Case", value: "Competitive Gaming, Streaming, Creative Work" },
      ],
    },
    {
      name: "BenQ PD3220U 32-inch 4K Thunderbolt 3 Designer Monitor",
      slug: "benq-pd3220u-4k",
      description:
        "Purpose-built for designers and video editors, the PD3220U covers 100% sRGB, 100% Rec. 709, 95% DCI-P3, and 100% Display P3 with factory calibration. Two Thunderbolt 3 ports enable daisy-chaining of two monitors from one laptop connection, delivering 85W of host charging each. Hardware calibration via CAL report ensures color accuracy stays consistent over time.",
      category: "Monitors",
      price: 1199.99,
      currency: "USD",
      stock: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewCount: 340,
      attributes: [
        { name: "Resolution", value: "4K UHD (3840 × 2160)" },
        { name: "Color Coverage", value: "100% sRGB, 95% DCI-P3, 100% Display P3" },
        { name: "Ports", value: "2× Thunderbolt 3 (85W PD + Daisy Chain), HDMI 2.0, DP 1.4" },
        { name: "Calibration", value: "Factory Calibrated ΔE < 2, Hardware CAL Report" },
        { name: "Use Case", value: "Graphic Design, Video Editing, CAD" },
      ],
    },

    // ── CATEGORY: Laptops (4 products) ───────────────────────────────────────
    {
      name: "Apple MacBook Pro 14-inch M3 (2024)",
      slug: "macbook-pro-14-m3",
      description:
        "The MacBook Pro 14 with M3 chip delivers groundbreaking performance for developers and creatives. The 8-core CPU and 10-core GPU with hardware ray tracing handle the most demanding compiles and renders at near-desktop speeds. Up to 22 hours of battery life, a stunning Liquid Retina XDR display at 1600 nits peak, and a three-fan active cooling system round out this engineering masterpiece.",
      category: "Laptops",
      price: 1999.0,
      currency: "USD",
      stock: 14,
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewCount: 2870,
      attributes: [
        { name: "Chip", value: "Apple M3 — 8-Core CPU, 10-Core GPU" },
        { name: "RAM / Storage", value: "16GB Unified Memory / 512GB SSD" },
        { name: "Display", value: "14.2\" Liquid Retina XDR — 3024×1964, 120Hz ProMotion" },
        { name: "Battery", value: "Up to 22 Hours" },
        { name: "Use Case", value: "iOS/macOS Dev, ML, Video Editing, Full-stack" },
      ],
    },
    {
      name: "Lenovo ThinkPad X1 Carbon Gen 12",
      slug: "thinkpad-x1-carbon-gen12",
      description:
        "Weighing just 1.12 kg, the X1 Carbon Gen 12 is the lightest business ultrabook in its class. Powered by Intel Core Ultra 7 165U with Intel AI Boost NPU, it handles AI-accelerated workloads and video calls effortlessly. MIL-SPEC 810H-certified for 12 durability tests, a 2.8K OLED optional display, and the legendary ThinkPad keyboard make this the corporate gold standard.",
      category: "Laptops",
      price: 1749.0,
      currency: "USD",
      stock: 9,
      imageUrl:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 1120,
      attributes: [
        { name: "CPU", value: "Intel Core Ultra 7 165U + Intel AI Boost NPU" },
        { name: "RAM / Storage", value: "32GB LPDDR5X / 1TB PCIe 4 SSD" },
        { name: "Display", value: "14\" 2.8K OLED, 120Hz, 100% DCI-P3" },
        { name: "Weight", value: "1.12 kg (MIL-SPEC 810H Certified)" },
        { name: "Use Case", value: "Enterprise, Road Warrior, AI Workloads" },
      ],
    },
    {
      name: "Dell XPS 15 (9530) OLED Laptop",
      slug: "dell-xps-15-9530",
      description:
        "The XPS 15 packs workstation-grade horsepower into a 1.86 kg aluminum and carbon fiber chassis. The 3.5K OLED touchscreen with 100% DCI-P3 and 0.2ms response time is the finest panel ever in an XPS. An Intel Core i7-13700H paired with an NVIDIA GeForce RTX 4060 handles 4K video editing and complex 3D rendering without breaking a sweat.",
      category: "Laptops",
      price: 2199.99,
      currency: "USD",
      stock: 7,
      imageUrl:
        "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 890,
      attributes: [
        { name: "CPU / GPU", value: "Intel Core i7-13700H + NVIDIA RTX 4060 8GB" },
        { name: "RAM / Storage", value: "32GB DDR5 / 1TB PCIe 4 NVMe SSD" },
        { name: "Display", value: "15.6\" 3.5K OLED Touchscreen — 100% DCI-P3, 0.2ms" },
        { name: "Weight", value: "1.86 kg — Aluminum & Carbon Fiber" },
        { name: "Use Case", value: "Video Editing, 3D Rendering, Software Dev" },
      ],
    },
    {
      name: "Framework Laptop 13 (AMD Ryzen 7040 Series)",
      slug: "framework-laptop-13-amd",
      description:
        "The most repairable and upgradeable laptop ever made. Framework's 13-inch laptop ships with an AMD Ryzen 7 7840U featuring integrated Radeon 780M graphics, upgradeable RAM and NVMe SSD, and four user-swappable expansion card slots that can be any combination of USB-C, USB-A, HDMI, DisplayPort, SD, and more. iFixit gives it a perfect 10/10 repairability score.",
      category: "Laptops",
      price: 1049.0,
      currency: "USD",
      stock: 16,
      imageUrl:
        "https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80",
      rating: 4.6,
      reviewCount: 670,
      attributes: [
        { name: "CPU / GPU", value: "AMD Ryzen 7 7840U — Radeon 780M iGPU" },
        { name: "RAM / Storage", value: "32GB DDR5-5600 / 1TB WD Black SN850X NVMe" },
        { name: "Display", value: "13.5\" 2256×1504 IPS — 100% sRGB, 400 nits" },
        { name: "Repairability", value: "iFixit 10/10 — User-Replaceable Everything" },
        { name: "Expansion", value: "4× Hot-Swap Expansion Card Slots" },
      ],
    },

    // ── CATEGORY: Mechanical Keyboards (3 products) ───────────────────────────
    {
      name: "Keychron Q5 Pro Wireless Mechanical Keyboard",
      slug: "keychron-q5-pro",
      description:
        "A full-size 96% layout keyboard in a solid CNC-machined aluminum frame with Keychron's double-gasket mounting system for a deep, satisfying thock. The K Pro Brown switches strike the perfect balance between tactile feedback and low noise for office environments. QMK/VIA programmable firmware, south-facing per-key RGB backlight, and Bluetooth 5.1 wireless.",
      category: "Mechanical Keyboards",
      price: 219.0,
      currency: "USD",
      stock: 18,
      imageUrl:
        "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 480,
      attributes: [
        { name: "Layout", value: "96% Full-Size (100 Keys)" },
        { name: "Switches", value: "K Pro Brown (Tactile, Hot-Swappable)" },
        { name: "Frame", value: "CNC Machined Aluminum — Double Gasket Mount" },
        { name: "Connectivity", value: "Bluetooth 5.1 / USB-C Wired" },
        { name: "Backlight", value: "South-Facing Per-Key RGB" },
      ],
    },
    {
      name: "HHKB Professional Hybrid Type-S Silent Keyboard",
      slug: "hhkb-professional-hybrid-type-s",
      description:
        "A cult classic among programmers and writers for 30 years. The Happy Hacking Keyboard Professional Hybrid Type-S uses Topre electrostatic capacitive switches—a unique mechanism that combines rubber domes with mechanical switch precision for an unparalleled typing feel. The Type-S variant adds silencing rings for near-silent keystrokes, perfect for quiet offices and late-night coding.",
      category: "Mechanical Keyboards",
      price: 349.0,
      currency: "USD",
      stock: 0,
      imageUrl:
        "https://images.unsplash.com/photo-1595044426077-d36d9236d54a?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewCount: 290,
      attributes: [
        { name: "Layout", value: "60% Compact (60 Keys)" },
        { name: "Switch", value: "Topre 45g Electrostatic Capacitive (Silenced)" },
        { name: "Connectivity", value: "Bluetooth 4.2 (4 Devices) + USB-C Wired" },
        { name: "Build", value: "PBT Dye-Sub Keycaps — No Shine, Zero Wobble" },
        { name: "Use Case", value: "Pro Typists, Programmers, Minimalist Setups" },
      ],
    },
    {
      name: "Ducky One 3 TKL Hot-Swap Mechanical Keyboard",
      slug: "ducky-one-3-tkl",
      description:
        "The Ducky One 3 TKL is a tenkeyless (87-key) keyboard built on a hot-swappable PCB that accepts any MX-compatible switch without soldering. Ships with Cherry MX Red switches for smooth linear keystrokes ideal for fast typing and gaming. PBT double-shot keycaps with vibrant dye-sub legends resist fade and shine for years. Gasket-mounted for a softer typing sound.",
      category: "Mechanical Keyboards",
      price: 139.0,
      currency: "USD",
      stock: 24,
      imageUrl:
        "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 820,
      attributes: [
        { name: "Layout", value: "TKL 80% (87 Keys)" },
        { name: "Switches", value: "Cherry MX Red Linear (Hot-Swappable)" },
        { name: "Keycaps", value: "PBT Double-Shot, Fade-Resistant Legends" },
        { name: "Mounting", value: "Gasket-Mount — Reduced Sound & Flex" },
        { name: "Use Case", value: "Gaming, Fast Typing, Compact Desk Setup" },
      ],
    },

    // ── CATEGORY: Travel & Bags (3 products) ──────────────────────────────────
    {
      name: "Peak Design Everyday Backpack 20L V2",
      slug: "peak-design-everyday-backpack-20l",
      description:
        "Peak Design's award-winning everyday carry, redesigned. Built from 100% recycled weatherproof 400D double poly-coated nylon canvas with an anodized aluminum MagLatch closure. Interior FlexFold dividers adapt to camera gear, gym clothes, or tech. Side sling access, internal organization pockets, and a 16\" laptop sleeve make this the only bag you'll ever need.",
      category: "Travel & Bags",
      price: 279.95,
      currency: "USD",
      stock: 15,
      imageUrl:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewCount: 520,
      attributes: [
        { name: "Capacity", value: "20 Liters" },
        { name: "Laptop Compartment", value: "Fits up to 16\" MacBook Pro" },
        { name: "Material", value: "Weatherproof 400D Recycled Nylon — MagLatch Closure" },
        { name: "Dividers", value: "FlexFold — Configurable for Camera or Everyday Gear" },
        { name: "Use Case", value: "Tech Travel, Commute, Photography, Day Hike" },
      ],
    },
    {
      name: "Cotopaxi Allpa 35L Travel Pack",
      slug: "cotopaxi-allpa-35l",
      description:
        "The Allpa 35L is the ultimate carry-on travel pack for the minimalist traveler. Its clamshell opening exposes the full packing space for easy airport security and organization. Dimensions comply with most international carry-on requirements. Made from 1000D Duraflex-buckled Cordura ripstop nylon. Integrated padded laptop sleeve, lockable zippers, and a detachable hip belt.",
      category: "Travel & Bags",
      price: 259.95,
      currency: "USD",
      stock: 20,
      imageUrl:
        "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 390,
      attributes: [
        { name: "Capacity", value: "35 Liters — Carry-On Compliant" },
        { name: "Opening", value: "Clamshell Full-Access Zip" },
        { name: "Material", value: "1000D Cordura Ripstop Nylon" },
        { name: "Laptop Sleeve", value: "Padded Sleeve for up to 15\"" },
        { name: "Use Case", value: "International Travel, Weekend Trips, One-Bag Travel" },
      ],
    },
    {
      name: "Nomadic Lane Packing Cubes Set (6-Piece)",
      slug: "nomadic-lane-packing-cubes-set",
      description:
        "Keep your suitcase or backpack perfectly organized with Nomadic Lane's 6-piece packing cube set. Includes 2 large, 2 medium, and 2 slim cubes crafted from ultralight 40D ripstop nylon—each cube weighs under 50g. Double-layer mesh tops improve air circulation and allow quick visual identification. Compression zippers reduce cube volume by up to 60% when packed.",
      category: "Travel & Bags",
      price: 59.99,
      currency: "USD",
      stock: 55,
      imageUrl:
        "https://images.unsplash.com/photo-1581553680321-4fffae59f543?auto=format&fit=crop&w=800&q=80",
      rating: 4.6,
      reviewCount: 1250,
      attributes: [
        { name: "Set Contents", value: "6 Cubes — 2L, 2M, 2 Slim" },
        { name: "Material", value: "40D Ultralight Ripstop Nylon" },
        { name: "Weight per Cube", value: "< 50g" },
        { name: "Compression", value: "Up to 60% Volume Reduction via Compression Zip" },
        { name: "Use Case", value: "Backpack & Suitcase Organization, Digital Nomads" },
      ],
    },

    // ── CATEGORY: Cameras (3 products) ────────────────────────────────────────
    {
      name: "Sony ZV-E10 APS-C Mirrorless Camera",
      slug: "sony-zv-e10-mirrorless",
      description:
        "Built from the ground up for content creators, the ZV-E10 pairs Sony's 24.2MP APS-C sensor with real-time Eye AF and a flip-out fully articulating LCD touchscreen. The E-mount accepts hundreds of Sony and third-party lenses. Clean HDMI output, a built-in directional 3-capsule mic, and a dedicated Bokeh switch for one-touch background blur make this the YouTuber's best friend.",
      category: "Cameras",
      price: 699.99,
      currency: "USD",
      stock: 13,
      imageUrl:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 1640,
      attributes: [
        { name: "Sensor", value: "24.2MP APS-C Exmor CMOS" },
        { name: "Autofocus", value: "Real-Time Eye AF + Tracking (425-Point Phase)" },
        { name: "Video", value: "4K 30fps, 1080p 120fps, Clean HDMI Out" },
        { name: "Audio", value: "Built-In Directional 3-Capsule Mic + Cold Shoe" },
        { name: "Use Case", value: "YouTube, Vlogging, Streaming, Travel Photography" },
      ],
    },
    {
      name: "GoPro HERO12 Black Action Camera",
      slug: "gopro-hero12-black",
      description:
        "The HERO12 Black shoots stunning 5.3K60 video and 27MP photos with HyperSmooth 6.0—the smoothest video stabilization GoPro has ever produced. The sensor's extended 1/1.9\" size captures 64% more light than HERO10, dramatically improving low-light footage. Waterproof to 10m without a housing, up to 70min of video, and GP-Log for professional color grading workflows.",
      category: "Cameras",
      price: 399.99,
      currency: "USD",
      stock: 28,
      imageUrl:
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 2100,
      attributes: [
        { name: "Max Video", value: "5.3K60 / 4K120 / 2.7K240" },
        { name: "Stabilization", value: "HyperSmooth 6.0 with Horizon Lock" },
        { name: "Sensor", value: "1/1.9\" — 64% More Light than HERO10" },
        { name: "Waterproofing", value: "10m Waterproof Without Housing" },
        { name: "Use Case", value: "Action Sports, Travel, POV, Underwater Filming" },
      ],
    },
    {
      name: "DJI Osmo Pocket 3 Creator Combo",
      slug: "dji-osmo-pocket-3",
      description:
        "The Pocket 3 is DJI's most advanced 3-axis stabilized handheld camera. The massive 1-inch CMOS sensor captures 4K120fps video with wide dynamic range, eliminating the need for a gimbal and camera combo. A 2-inch rotatable OLED touchscreen makes solo vlogging framing effortless. The Creator Combo adds a Mini Tripod, Carrying Case, ND Filter Set, and Bluetooth Microphone Transmitter.",
      category: "Cameras",
      price: 599.0,
      currency: "USD",
      stock: 17,
      imageUrl:
        "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80",
      rating: 4.9,
      reviewCount: 960,
      attributes: [
        { name: "Sensor", value: "1-Inch CMOS — Wide Dynamic Range" },
        { name: "Max Video", value: "4K120fps, 4K HDR" },
        { name: "Stabilization", value: "3-Axis Mechanical Gimbal, < 0.01° Precision" },
        { name: "Screen", value: "2\" Rotatable OLED Touchscreen" },
        { name: "Use Case", value: "Travel Vlogging, Solo Content Creation, Cinematic" },
      ],
    },

    // ── CATEGORY: Smart Home (3 products) ─────────────────────────────────────
    {
      name: "Philips Hue Smart Lighting Starter Kit (3 Bulbs + Bridge)",
      slug: "philips-hue-starter-kit",
      description:
        "The complete Philips Hue ecosystem entry point. Includes 3× A19 White & Color Ambiance smart bulbs (16 million colors, 800 lumens each) and the Hue Bridge for local processing. Control with the Hue app, Amazon Alexa, Google Assistant, or Apple HomeKit. Create lighting automations, sync to your music and entertainment, and build scenes for every mood.",
      category: "Smart Home",
      price: 199.99,
      currency: "USD",
      stock: 35,
      imageUrl:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      rating: 4.7,
      reviewCount: 3450,
      attributes: [
        { name: "Bulbs Included", value: "3× A19 E26 — 800lm, 16M Colors + White" },
        { name: "Bridge", value: "Hue Bridge — Local Control, Zigbee 3.0" },
        { name: "Compatibility", value: "Alexa, Google Assistant, Apple HomeKit, SmartThings" },
        { name: "Connectivity", value: "Zigbee Mesh via Hue Bridge (Ethernet)" },
        { name: "Use Case", value: "Ambiance, Automations, Gaming Sync, WFH Lighting" },
      ],
    },
    {
      name: "Amazon Echo Studio Hi-Fi Smart Speaker",
      slug: "amazon-echo-studio",
      description:
        "Echo Studio delivers premium 3D audio with 330W total output across a 1\" tweeter, three 2\" midrange drivers, and a 5.25\" woofer with a downward-firing bass port. Built-in Dolby Atmos and Sony 360 Reality Audio processing create an immersive soundstage from any room corner. Automatically calibrates its sound via built-in microphones to your room's acoustics at first boot.",
      category: "Smart Home",
      price: 199.99,
      currency: "USD",
      stock: 30,
      imageUrl:
        "https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80",
      rating: 4.6,
      reviewCount: 2890,
      attributes: [
        { name: "Total Power", value: "330W — 5 Speaker Drivers" },
        { name: "Audio Tech", value: "Dolby Atmos + Sony 360 Reality Audio" },
        { name: "Room Calibration", value: "Automatic Acoustic Room Adaptation" },
        { name: "Connectivity", value: "Wi-Fi 5, Bluetooth 5.0, Zigbee Hub Built-in" },
        { name: "Use Case", value: "Hi-Fi Music, Smart Home Hub, Alexa Voice Control" },
      ],
    },
    {
      name: "Elgato Stream Deck MK2",
      slug: "elgato-stream-deck-mk2",
      description:
        "Command your content with 15 fully customizable LCD keys that trigger actions in your streaming or recording software, switch scenes in OBS, control Spotify, mute Discord, and execute any shortcut or macro—all from a single button press. The detachable faceplate makes it easy to swap bezels for custom looks. Pairs with Elgato's free Stream Deck software for unlimited profiles and key icons.",
      category: "Smart Home",
      price: 149.99,
      currency: "USD",
      stock: 25,
      imageUrl:
        "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
      reviewCount: 4100,
      attributes: [
        { name: "LCD Keys", value: "15 Customizable Full-Color LCD Keys" },
        { name: "Software", value: "Free Stream Deck App — Unlimited Profiles & Plugins" },
        { name: "Integrations", value: "OBS, Twitch, YouTube, Spotify, Discord, Zoom" },
        { name: "Connectivity", value: "USB-C — Swappable Faceplates" },
        { name: "Use Case", value: "Streaming, Podcasting, Content Creation, Hotkeys" },
      ],
    },
  ];

  // ─── Insert Products + Attributes + Inventory Events ────────────────────────
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

    // Record an initial inventory event for each product
    await prisma.inventoryEvent.create({
      data: {
        productId: createdProduct.id,
        changeAmount: item.stock,
        reason: "INITIAL_SEED",
        referenceId: "SEED_INIT_V2",
      },
    });
  }

  console.log(`📦 Seeded ${products.length} products across 8 categories with attributes & inventory events.`);

  // ─── Helper: resolve product IDs by slug ─────────────────────────────────────
  const getProductId = async (slug: string) => {
    const p = await prisma.product.findFirst({ where: { slug } });
    if (!p) throw new Error(`Product slug not found: ${slug}`);
    return p.id;
  };

  // ─── Sample Order 1 — Alex Customer (Sony + Logitech Mouse) ─────────────────
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-100001",
      userId: customerUser.id,
      customerName: customerUser.name!,
      customerEmail: customerUser.email,
      status: "COMPLETED",
      subtotal: 449.98,
      tax: 36.0,
      shipping: 0.0,
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
            productId: await getProductId("sony-wh-1000xm5"),
            productName: "Sony WH-1000XM5 Wireless Noise-Canceling Headphones",
            quantity: 1,
            unitPrice: 349.99,
            lineTotal: 349.99,
          },
          {
            productId: await getProductId("logitech-mx-master-3s"),
            productName: "Logitech MX Master 3S Wireless Performance Mouse",
            quantity: 1,
            unitPrice: 99.99,
            lineTotal: 99.99,
          },
        ],
      },
      payments: {
        create: {
          paypalOrderId: "PAYPAL-SANDBOX-ORD-001",
          paypalCaptureId: "CAPTURE-SANDBOX-001",
          amount: 485.98,
          currency: "USD",
          status: "COMPLETED",
          payerEmail: "buyer-sandbox@paypilot.io",
          payerId: "SANDBOX_PAYER_001",
          rawResponse: JSON.stringify({ status: "COMPLETED", source: "SEED_DATA" }),
        },
      },
      auditEvents: {
        create: [
          {
            entityType: "ORDER",
            entityId: "ORD-100001",
            action: "CREATE",
            performedBy: `CUSTOMER:${customerUser.id}`,
          },
          {
            entityType: "PAYMENT",
            entityId: "CAPTURE-SANDBOX-001",
            action: "CAPTURE",
            performedBy: "PAYPAL_API",
          },
        ],
      },
    },
  });

  // ─── Sample Order 2 — Jane Doe (MacBook Pro + CalDigit Dock) ────────────────
  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-100002",
      userId: customer2.id,
      customerName: customer2.name!,
      customerEmail: customer2.email,
      status: "COMPLETED",
      subtotal: 2398.99,
      tax: 192.0,
      shipping: 0.0,
      total: 2590.99,
      currency: "USD",
      shippingAddress: JSON.stringify({
        fullName: "Jane Doe",
        addressLine1: "456 Market Street",
        city: "San Francisco",
        state: "CA",
        postalCode: "94105",
        countryCode: "US",
      }),
      items: {
        create: [
          {
            productId: await getProductId("macbook-pro-14-m3"),
            productName: "Apple MacBook Pro 14-inch M3 (2024)",
            quantity: 1,
            unitPrice: 1999.0,
            lineTotal: 1999.0,
          },
          {
            productId: await getProductId("caldigit-ts4-thunderbolt-dock"),
            productName: "CalDigit TS4 Thunderbolt 4 Dock",
            quantity: 1,
            unitPrice: 399.99,
            lineTotal: 399.99,
          },
        ],
      },
      payments: {
        create: {
          paypalOrderId: "PAYPAL-SANDBOX-ORD-002",
          paypalCaptureId: "CAPTURE-SANDBOX-002",
          amount: 2590.99,
          currency: "USD",
          status: "COMPLETED",
          payerEmail: "jane.doe-sandbox@paypilot.io",
          payerId: "SANDBOX_PAYER_002",
          rawResponse: JSON.stringify({ status: "COMPLETED", source: "SEED_DATA" }),
        },
      },
      auditEvents: {
        create: [
          {
            entityType: "ORDER",
            entityId: "ORD-100002",
            action: "CREATE",
            performedBy: `CUSTOMER:${customer2.id}`,
          },
          {
            entityType: "PAYMENT",
            entityId: "CAPTURE-SANDBOX-002",
            action: "CAPTURE",
            performedBy: "PAYPAL_API",
          },
        ],
      },
    },
  });

  // ─── Sample Order 3 — Mark Chen (HHKB + Peak Design + DJI Pocket 3) ─────────
  const order3 = await prisma.order.create({
    data: {
      orderNumber: "ORD-100003",
      userId: customer3.id,
      customerName: customer3.name!,
      customerEmail: customer3.email,
      status: "PROCESSING",
      subtotal: 1227.95,
      tax: 98.24,
      shipping: 12.99,
      total: 1339.18,
      currency: "USD",
      shippingAddress: JSON.stringify({
        fullName: "Mark Chen",
        addressLine1: "789 Tech Blvd",
        city: "Austin",
        state: "TX",
        postalCode: "78701",
        countryCode: "US",
      }),
      items: {
        create: [
          {
            productId: await getProductId("hhkb-professional-hybrid-type-s"),
            productName: "HHKB Professional Hybrid Type-S Silent Keyboard",
            quantity: 1,
            unitPrice: 349.0,
            lineTotal: 349.0,
          },
          {
            productId: await getProductId("peak-design-everyday-backpack-20l"),
            productName: "Peak Design Everyday Backpack 20L V2",
            quantity: 1,
            unitPrice: 279.95,
            lineTotal: 279.95,
          },
          {
            productId: await getProductId("dji-osmo-pocket-3"),
            productName: "DJI Osmo Pocket 3 Creator Combo",
            quantity: 1,
            unitPrice: 599.0,
            lineTotal: 599.0,
          },
        ],
      },
      payments: {
        create: {
          paypalOrderId: "PAYPAL-SANDBOX-ORD-003",
          paypalCaptureId: "CAPTURE-SANDBOX-003",
          amount: 1339.18,
          currency: "USD",
          status: "COMPLETED",
          payerEmail: "mark.chen-sandbox@paypilot.io",
          payerId: "SANDBOX_PAYER_003",
          rawResponse: JSON.stringify({ status: "COMPLETED", source: "SEED_DATA" }),
        },
      },
      auditEvents: {
        create: [
          {
            entityType: "ORDER",
            entityId: "ORD-100003",
            action: "CREATE",
            performedBy: `CUSTOMER:${customer3.id}`,
          },
          {
            entityType: "PAYMENT",
            entityId: "CAPTURE-SANDBOX-003",
            action: "CAPTURE",
            performedBy: "PAYPAL_API",
          },
        ],
      },
    },
  });

  const totalRevenue = order1.total + order2.total + order3.total;

  console.log(`✅ Seeded 3 sample orders:`);
  console.log(`   ${order1.orderNumber} — Alex Customer  — $${order1.total.toFixed(2)} (COMPLETED)`);
  console.log(`   ${order2.orderNumber} — Jane Doe       — $${order2.total.toFixed(2)} (COMPLETED)`);
  console.log(`   ${order3.orderNumber} — Mark Chen      — $${order3.total.toFixed(2)} (PROCESSING)`);
  console.log(`💰 Total seeded revenue: $${totalRevenue.toFixed(2)}`);
  console.log(`\n🎉 Database seeding complete! ${products.length} products, 4 users, 3 orders.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
