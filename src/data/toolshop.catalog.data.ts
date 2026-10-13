export interface ToolshopProductSpec {
  id: string;
  product_id: string;
  spec_name: string;
  spec_value: string;
  spec_unit: string | null;
}

export interface ToolshopBrand {
  id: string;
  name: string;
  slug: string;
}

export interface ToolshopCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sub_categories?: ToolshopCategory[];
}

export interface ToolshopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  is_location_offer: boolean;
  is_rental: boolean;
  co2_rating: 'A' | 'B' | 'C' | 'D' | 'E';
  in_stock: boolean;
  is_eco_friendly: boolean;
  product_image: {
    id: string;
    by_name: string;
    by_url: string;
    source_name: string;
    source_url: string;
    file_name: string;
    title: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
  };
  brand: {
    id: string;
    name: string;
    slug?: string;
  };
  specs: ToolshopProductSpec[];
}

export const TOOLSHOP_BRANDS: ToolshopBrand[] = [
  {
    id: '01JBRANDFORGEFLEX000000001',
    name: 'ForgeFlex Tools',
    slug: 'forgeflex-tools',
  },
  {
    id: '01JBRANDMIGHTYCRAFT0000002',
    name: 'MightyCraft Hardware',
    slug: 'mightycraft-hardware',
  },
];

export const TOOLSHOP_CATEGORIES_TREE: ToolshopCategory[] = [
  {
    id: '01JCATROOTHANDTOOLS0000001',
    name: 'Hand Tools',
    slug: 'hand-tools',
    parent_id: null,
    sub_categories: [
      {
        id: '01JCATSUBHAMMER00000000011',
        name: 'Hammer',
        slug: 'hammer',
        parent_id: '01JCATROOTHANDTOOLS0000001',
        sub_categories: [],
      },
      {
        id: '01JCATSUBHANDSAW0000000012',
        name: 'Hand Saw',
        slug: 'hand-saw',
        parent_id: '01JCATROOTHANDTOOLS0000001',
        sub_categories: [],
      },
      {
        id: '01JCATSUBWRENCH00000000013',
        name: 'Wrench',
        slug: 'wrench',
        parent_id: '01JCATROOTHANDTOOLS0000001',
        sub_categories: [],
      },
      {
        id: '01JCATSUBSCREWDRIVER000014',
        name: 'Screwdriver',
        slug: 'screwdriver',
        parent_id: '01JCATROOTHANDTOOLS0000001',
        sub_categories: [],
      },
      {
        id: '01JCATSUBPLIERS00000000015',
        name: 'Pliers',
        slug: 'pliers',
        parent_id: '01JCATROOTHANDTOOLS0000001',
        sub_categories: [],
      },
      {
        id: '01JCATSUBCHISELS0000000016',
        name: 'Chisels',
        slug: 'chisels',
        parent_id: '01JCATROOTHANDTOOLS0000001',
        sub_categories: [],
      },
    ],
  },
  {
    id: '01JCATROOTPOWERTOOLS000002',
    name: 'Power Tools',
    slug: 'power-tools',
    parent_id: null,
    sub_categories: [
      {
        id: '01JCATSUBGRINDER0000000021',
        name: 'Grinder',
        slug: 'grinder',
        parent_id: '01JCATROOTPOWERTOOLS000002',
        sub_categories: [],
      },
      {
        id: '01JCATSUBSANDER00000000022',
        name: 'Sander',
        slug: 'sander',
        parent_id: '01JCATROOTPOWERTOOLS000002',
        sub_categories: [],
      },
      {
        id: '01JCATSUBSAW00000000000023',
        name: 'Saw',
        slug: 'saw',
        parent_id: '01JCATROOTPOWERTOOLS000002',
        sub_categories: [],
      },
      {
        id: '01JCATSUBDRILL000000000024',
        name: 'Drill',
        slug: 'drill',
        parent_id: '01JCATROOTPOWERTOOLS000002',
        sub_categories: [],
      },
    ],
  },
  {
    id: '01JCATROOTOTHER00000000003',
    name: 'Other',
    slug: 'other',
    parent_id: null,
    sub_categories: [
      {
        id: '01JCATSUBTOOLBELTS00000031',
        name: 'Tool Belts',
        slug: 'tool-belts',
        parent_id: '01JCATROOTOTHER00000000003',
        sub_categories: [],
      },
      {
        id: '01JCATSUBSTORAGE0000000032',
        name: 'Storage Solutions',
        slug: 'storage-solutions',
        parent_id: '01JCATROOTOTHER00000000003',
        sub_categories: [],
      },
      {
        id: '01JCATSUBSAFETYGEAR0000033',
        name: 'Safety Gear',
        slug: 'safety-gear',
        parent_id: '01JCATROOTOTHER00000000003',
        sub_categories: [],
      },
    ],
  },
];

function buildSpecs(
  productId: string,
  handleMaterial: string,
  lengthMm: string,
  material: string,
  warrantyYears: string,
  weightGrams: string
): ToolshopProductSpec[] {
  return [
    {
      id: `${productId}-SPEC1`,
      product_id: productId,
      spec_name: 'Handle Material',
      spec_value: handleMaterial,
      spec_unit: null,
    },
    {
      id: `${productId}-SPEC2`,
      product_id: productId,
      spec_name: 'Length',
      spec_value: lengthMm,
      spec_unit: 'mm',
    },
    {
      id: `${productId}-SPEC3`,
      product_id: productId,
      spec_name: 'Material',
      spec_value: material,
      spec_unit: null,
    },
    {
      id: `${productId}-SPEC4`,
      product_id: productId,
      spec_name: 'Warranty',
      spec_value: warrantyYears,
      spec_unit: 'years',
    },
    {
      id: `${productId}-SPEC5`,
      product_id: productId,
      spec_name: 'Weight',
      spec_value: weightGrams,
      spec_unit: 'g',
    },
  ];
}

export const TOOLSHOP_PRODUCTS: ToolshopProduct[] = [
  {
    id: '01JTOOLSHOPPROD00000000001',
    name: 'Combination Pliers',
    description:
      'Versatile combination pliers designed for gripping, bending, and cutting wire with ease. Featuring chrome vanadium steel construction with induction-hardened cutting edges.',
    price: 14.15,
    is_location_offer: false,
    is_rental: false,
    co2_rating: 'D',
    in_stock: true,
    is_eco_friendly: false,
    product_image: {
      id: 'IMG-01',
      by_name: 'Helinton Fantin',
      by_url: 'https://unsplash.com/@fantin',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/W8BNwvOvW4M',
      file_name: 'pliers01.avif',
      title: 'Combination pliers',
    },
    category: {
      id: '01JCATSUBPLIERS00000000015',
      name: 'Pliers',
      slug: 'pliers',
      parent_id: '01JCATROOTHANDTOOLS0000001',
    },
    brand: TOOLSHOP_BRANDS[0],
    specs: buildSpecs(
      '01JTOOLSHOPPROD00000000001',
      'Bi-component',
      '200',
      'Chrome Vanadium Steel',
      '2',
      '340'
    ),
  },
  {
    id: '01JTOOLSHOPPROD00000000002',
    name: 'Pliers',
    description:
      'Professional-grade linesman pliers engineered for heavy-duty electrical and mechanical applications with precision-milled jaws.',
    price: 12.01,
    is_location_offer: false,
    is_rental: false,
    co2_rating: 'B',
    in_stock: true,
    is_eco_friendly: true,
    product_image: {
      id: 'IMG-02',
      by_name: 'Jen Theodore',
      by_url: 'https://unsplash.com/@jentheodore',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/pliers02',
      file_name: 'pliers02.avif',
      title: 'Pliers',
    },
    category: {
      id: '01JCATSUBPLIERS00000000015',
      name: 'Pliers',
      slug: 'pliers',
      parent_id: '01JCATROOTHANDTOOLS0000001',
    },
    brand: TOOLSHOP_BRANDS[0],
    specs: buildSpecs(
      '01JTOOLSHOPPROD00000000002',
      'Recycled TPR',
      '180',
      'Carbon Steel',
      '3',
      '290'
    ),
  },
  {
    id: '01JTOOLSHOPPROD00000000003',
    name: 'Bolt Cutters',
    description:
      'High-leverage industrial bolt cutters capable of shearing padlocks, chains, threaded rods, and heavy steel wire mesh effortlessly.',
    price: 48.41,
    is_location_offer: true,
    is_rental: false,
    co2_rating: 'D',
    in_stock: true,
    is_eco_friendly: false,
    product_image: {
      id: 'IMG-03',
      by_name: 'Michael Dziedzic',
      by_url: 'https://unsplash.com/@lazycreekimages',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/pliers03',
      file_name: 'pliers03.avif',
      title: 'Bolt cutters',
    },
    category: {
      id: '01JCATSUBPLIERS00000000015',
      name: 'Pliers',
      slug: 'pliers',
      parent_id: '01JCATROOTHANDTOOLS0000001',
    },
    brand: TOOLSHOP_BRANDS[1],
    specs: buildSpecs(
      '01JTOOLSHOPPROD00000000003',
      'Tubular Steel Rubberized',
      '600',
      'Forged Alloy Steel',
      '5',
      '2450'
    ),
  },
  {
    id: '01JTOOLSHOPPROD00000000004',
    name: 'Long Nose Pliers',
    description:
      'Extra-long tapered needle nose pliers built for reaching into confined electrical enclosures and precision jewelry or PCB assembly.',
    price: 14.24,
    is_location_offer: false,
    is_rental: false,
    co2_rating: 'C',
    in_stock: false,
    is_eco_friendly: false,
    product_image: {
      id: 'IMG-04',
      by_name: 'Brett Jordan',
      by_url: 'https://unsplash.com/@brett_jordan',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/pliers04',
      file_name: 'pliers04.avif',
      title: 'Long nose pliers',
    },
    category: {
      id: '01JCATSUBPLIERS00000000015',
      name: 'Pliers',
      slug: 'pliers',
      parent_id: '01JCATROOTHANDTOOLS0000001',
    },
    brand: TOOLSHOP_BRANDS[0],
    specs: buildSpecs(
      '01JTOOLSHOPPROD00000000004',
      'Ergonomic Vinyl',
      '205',
      'Tool Steel',
      '2',
      '210'
    ),
  },
  {
    id: '01JTOOLSHOPPROD00000000005',
    name: 'Slip Joint Pliers',
    description:
      'Dual-position adjustable slip joint utility pliers accommodating flat and round fasteners across automotive and plumbing repairs.',
    price: 9.17,
    is_location_offer: false,
    is_rental: false,
    co2_rating: 'A',
    in_stock: true,
    is_eco_friendly: true,
    product_image: {
      id: 'IMG-05',
      by_name: 'Yasin Hasan',
      by_url: 'https://unsplash.com/@yasin',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/pliers05',
      file_name: 'pliers05.avif',
      title: 'Slip joint pliers',
    },
    category: {
      id: '01JCATSUBPLIERS00000000015',
      name: 'Pliers',
      slug: 'pliers',
      parent_id: '01JCATROOTHANDTOOLS0000001',
    },
    brand: TOOLSHOP_BRANDS[1],
    specs: buildSpecs(
      '01JTOOLSHOPPROD00000000005',
      'Bio-Polymer Grip',
      '165',
      'Recycled Carbon Steel',
      '3',
      '250'
    ),
  },
  {
    id: '01JTOOLSHOPPROD00000000006',
    name: 'Claw Hammer with Shock Reduction Grip',
    description:
      'One-piece forged framing claw hammer engineered with a vibration-damping grip that reduces impact shock by up to 70%.',
    price: 13.41,
    is_location_offer: false,
    is_rental: false,
    co2_rating: 'B',
    in_stock: true,
    is_eco_friendly: true,
    product_image: {
      id: 'IMG-06',
      by_name: 'Ibrahim Rifath',
      by_url: 'https://unsplash.com/@photoripey',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/hammer01',
      file_name: 'hammer01.avif',
      title: 'Claw Hammer',
    },
    category: {
      id: '01JCATSUBHAMMER00000000011',
      name: 'Hammer',
      slug: 'hammer',
      parent_id: '01JCATROOTHANDTOOLS0000001',
    },
    brand: TOOLSHOP_BRANDS[0],
    specs: buildSpecs(
      '01JTOOLSHOPPROD00000000006',
      'Shock-Absorbing Nylon',
      '330',
      'Drop-Forged Steel',
      '5',
      '680'
    ),
  },
  {
    id: '01JTOOLSHOPPROD00000000007',
    name: 'Thor Hammer',
    description:
      'Heavy-hitting blacksmith and demolition sledge hammer crafted for driving stakes, breaking masonry, and heavy metalwork.',
    price: 11.14,
    is_location_offer: false,
    is_rental: false,
    co2_rating: 'D',
    in_stock: true,
    is_eco_friendly: false,
    product_image: {
      id: 'IMG-07',
      by_name: 'ANIRUDH',
      by_url: 'https://unsplash.com/@lanirudhreddy',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/hammer04',
      file_name: 'hammer04.avif',
      title: 'Thor Hammer',
    },
    category: {
      id: '01JCATSUBHAMMER00000000011',
      name: 'Hammer',
      slug: 'hammer',
      parent_id: '01JCATROOTHANDTOOLS0000001',
    },
    brand: TOOLSHOP_BRANDS[1],
    specs: buildSpecs(
      '01JTOOLSHOPPROD00000000007',
      'Fiberglass Core',
      '380',
      'Hardened High-Carbon Steel',
      '3',
      '1250'
    ),
  },
  {
    id: '01JTOOLSHOPPROD00000000008',
    name: 'Wood Saw',
    description:
      'Triple-ground induction-hardened tooth hand saw delivering rapid, clean cross-cuts and rip-cuts through hardwood and softwood lumber.',
    price: 12.18,
    is_location_offer: false,
    is_rental: false,
    co2_rating: 'A',
    in_stock: true,
    is_eco_friendly: true,
    product_image: {
      id: 'IMG-08',
      by_name: '小野 友也',
      by_url: 'https://unsplash.com/@tomoya_ono',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/saw01',
      file_name: 'saw01.avif',
      title: 'Wood Saw',
    },
    category: {
      id: '01JCATSUBHANDSAW0000000012',
      name: 'Hand Saw',
      slug: 'hand-saw',
      parent_id: '01JCATROOTHANDTOOLS0000001',
    },
    brand: TOOLSHOP_BRANDS[0],
    specs: buildSpecs(
      '01JTOOLSHOPPROD00000000008',
      'FSC Certified Beechwood',
      '550',
      'Swedish Spring Steel',
      '2',
      '420'
    ),
  },
  {
    id: '01JTOOLSHOPPROD00000000009',
    name: 'Adjustable Wrench',
    description:
      'Precision knurled-worm adjustable crescent wrench with laser-etched metric and imperial jaw scales for fast fastener sizing.',
    price: 20.33,
    is_location_offer: false,
    is_rental: false,
    co2_rating: 'B',
    in_stock: true,
    is_eco_friendly: true,
    product_image: {
      id: 'IMG-09',
      by_name: 'Matt Artz',
      by_url: 'https://unsplash.com/@mattartz',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/wrench01',
      file_name: 'wrench01.avif',
      title: 'Adjustable Wrench',
    },
    category: {
      id: '01JCATSUBWRENCH00000000013',
      name: 'Wrench',
      slug: 'wrench',
      parent_id: '01JCATROOTHANDTOOLS0000001',
    },
    brand: TOOLSHOP_BRANDS[0],
    specs: buildSpecs(
      '01JTOOLSHOPPROD00000000009',
      'Satin Chrome Steel',
      '250',
      'Chrome Vanadium',
      '5',
      '490'
    ),
  },
  {
    id: '01JTOOLSHOPPROD00000000010',
    name: 'Cordless Drill 24V',
    description:
      'Brushless 24V lithium-ion cordless hammer drill driver featuring a 2-speed all-metal transmission, 20+1 torque clutch, and LED worklight.',
    price: 66.54,
    is_location_offer: true,
    is_rental: false,
    co2_rating: 'E',
    in_stock: true,
    is_eco_friendly: false,
    product_image: {
      id: 'IMG-10',
      by_name: 'milafot',
      by_url: 'https://unsplash.com/@milafot',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/drill01',
      file_name: 'drill01.avif',
      title: 'Cordless Drill 24V',
    },
    category: {
      id: '01JCATSUBDRILL000000000024',
      name: 'Drill',
      slug: 'drill',
      parent_id: '01JCATROOTPOWERTOOLS000002',
    },
    brand: TOOLSHOP_BRANDS[1],
    specs: buildSpecs(
      '01JTOOLSHOPPROD00000000010',
      'Overmolded Elastomer',
      '215',
      'Reinforced Polyamide & Steel',
      '3',
      '1580'
    ),
  },
  {
    id: '01JTOOLSHOPPROD00000000011',
    name: 'Sheet Sander',
    description:
      'Low-vibration orbital finishing sheet sander with integrated micro-filter dust canister and ergonomic palm grip.',
    price: 58.35,
    is_location_offer: false,
    is_rental: false,
    co2_rating: 'C',
    in_stock: true,
    is_eco_friendly: false,
    product_image: {
      id: 'IMG-11',
      by_name: 'Utility',
      by_url: 'https://unsplash.com/@utility',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/sander01',
      file_name: 'sander01.avif',
      title: 'Sheet Sander',
    },
    category: {
      id: '01JCATSUBSANDER00000000022',
      name: 'Sander',
      slug: 'sander',
      parent_id: '01JCATROOTPOWERTOOLS000002',
    },
    brand: TOOLSHOP_BRANDS[1],
    specs: buildSpecs(
      '01JTOOLSHOPPROD00000000011',
      'Soft-Grip Composite',
      '240',
      'Aluminum Base & ABS',
      '2',
      '1420'
    ),
  },
  {
    id: '01JTOOLSHOPPROD00000000012',
    name: 'Leather Toolbelt',
    description:
      'Heavy-duty top-grain oil-tanned leather carpenter tool belt with 12 reinforced pockets, dual steel hammer loops, and padded waist support.',
    price: 42.63,
    is_location_offer: false,
    is_rental: false,
    co2_rating: 'A',
    in_stock: true,
    is_eco_friendly: true,
    product_image: {
      id: 'IMG-12',
      by_name: 'Craftsman',
      by_url: 'https://unsplash.com/@craftsman',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/toolbelt01',
      file_name: 'toolbelt01.avif',
      title: 'Leather Toolbelt',
    },
    category: {
      id: '01JCATSUBTOOLBELTS00000031',
      name: 'Tool Belts',
      slug: 'tool-belts',
      parent_id: '01JCATROOTOTHER00000000003',
    },
    brand: TOOLSHOP_BRANDS[0],
    specs: buildSpecs(
      '01JTOOLSHOPPROD00000000012',
      'Full-Grain Leather',
      '1200',
      'Vegetable-Tanned Saddle Leather',
      '5',
      '920'
    ),
  },
];

export const TOOLSHOP_RENTALS: ToolshopProduct[] = [
  {
    id: '01JTOOLSHOPRENTAL000000001',
    name: 'Excavator',
    description:
      'Heavy-duty tracked excavator available for hourly rental, designed for professional foundation digging, trenching, utility installation, and general earthmoving operations.',
    price: 136.5,
    is_location_offer: true,
    is_rental: true,
    co2_rating: 'E',
    in_stock: true,
    is_eco_friendly: false,
    product_image: {
      id: 'IMG-R01',
      by_name: 'John Kakuk',
      by_url: 'https://unsplash.com/@mgnfy',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/HvvPceHYLOg',
      file_name: 'excavator01.avif',
      title: 'Excavator',
    },
    category: {
      id: '01JCATSUBDRILL000000000024',
      name: 'Drill',
      slug: 'drill',
      parent_id: '01JCATROOTPOWERTOOLS000002',
    },
    brand: TOOLSHOP_BRANDS[0],
    specs: buildSpecs('01JTOOLSHOPRENTAL000000001', 'Joystick Hydraulic', '4800', 'Structural Steel', '1', '8500000'),
  },
  {
    id: '01JTOOLSHOPRENTAL000000002',
    name: 'Bulldozer',
    description:
      'Robust tracked bulldozer available for hourly rental, built for heavy-duty grading, site clearing, land leveling, and large-volume earthmoving operations.',
    price: 147.5,
    is_location_offer: true,
    is_rental: true,
    co2_rating: 'E',
    in_stock: true,
    is_eco_friendly: false,
    product_image: {
      id: 'IMG-R02',
      by_name: 'Zac Edmonds',
      by_url: 'https://unsplash.com/@zacedmo',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/N1LBcqLP9ec',
      file_name: 'bulldozer01.avif',
      title: 'Bulldozer',
    },
    category: {
      id: '01JCATSUBDRILL000000000024',
      name: 'Drill',
      slug: 'drill',
      parent_id: '01JCATROOTPOWERTOOLS000002',
    },
    brand: TOOLSHOP_BRANDS[0],
    specs: buildSpecs('01JTOOLSHOPRENTAL000000002', 'Hydrostatic Cab', '5200', 'Reinforced Armor Steel', '1', '11200000'),
  },
  {
    id: '01JTOOLSHOPRENTAL000000003',
    name: 'Crane',
    description:
      'Mobile hydraulic crane available for hourly rental, purpose-engineered for lifting, positioning, and placing heavy loads on active construction sites.',
    price: 153.5,
    is_location_offer: true,
    is_rental: true,
    co2_rating: 'E',
    in_stock: true,
    is_eco_friendly: false,
    product_image: {
      id: 'IMG-R03',
      by_name: 'Ade Adebowale',
      by_url: 'https://unsplash.com/@adebowax',
      source_name: 'Unsplash',
      source_url: 'https://unsplash.com/photos/DKr6BEdI2sE',
      file_name: 'crane01.avif',
      title: 'Crane',
    },
    category: {
      id: '01JCATSUBDRILL000000000024',
      name: 'Drill',
      slug: 'drill',
      parent_id: '01JCATROOTPOWERTOOLS000002',
    },
    brand: TOOLSHOP_BRANDS[1],
    specs: buildSpecs('01JTOOLSHOPRENTAL000000003', 'Proportional Load Control', '12000', 'Telescoping Alloy Boom', '1', '18500000'),
  },
];
