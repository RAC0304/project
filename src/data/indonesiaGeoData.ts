import { FeatureCollection, Feature, Geometry } from 'geojson';

export interface RegionProperties {
    name: string;
    description?: string;
    population?: number;
    imageUrl?: string;
    destinations?: string[];
}

export const indonesiaGeoData: FeatureCollection<Geometry, RegionProperties> = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {
                name: 'Sumatra',
                description: 'Indonesia\'s westernmost island, known for diverse wildlife and natural beauty.',
                population: 58000000,
                imageUrl: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
                destinations: ['Lake Toba', 'Bukit Lawang', 'Mentawai Islands', 'Padang']
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [95.2734, 5.9045], [95.8301, 5.3955], [96.3867, 4.7461], [97.0312, 4.0131],
                    [98.0859, 3.5595], [98.877, 3.0103], [99.5215, 2.1094], [100.1025, 1.0986],
                    [100.5371, -0.0879], [101.25, -1.0547], [102.041, -1.9336], [102.6855, -2.9883],
                    [103.1836, -3.9551], [103.7109, -5.0098], [104.1504, -5.7861], [103.6523, -5.3613],
                    [103.0859, -4.9365], [102.4805, -4.4238], [101.8359, -3.7793], [101.25, -3.1348],
                    [100.6055, -2.6221], [99.9609, -2.1973], [99.2285, -1.6846], [98.5352, -1.1719],
                    [97.8809, -0.5273], [97.207, 0.0293], [96.6211, 0.6738], [96.0938, 1.4063],
                    [95.6543, 2.1973], [95.2734, 3.0762], [94.9512, 4.043], [94.8633, 4.9219],
                    [95.2734, 5.9045]
                ]]
            }
        },
        {
            type: 'Feature',
            properties: {
                name: 'Java',
                description: 'Indonesia\'s most populous island, home to the capital Jakarta and ancient temples.',
                population: 151000000,
                imageUrl: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
                destinations: ['Jakarta', 'Yogyakarta', 'Borobudur', 'Mount Bromo', 'Bandung']
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [105.7031, -5.6836], [106.6113, -6.0645], [107.4316, -6.4453], [108.3984, -6.8262],
                    [109.3066, -7.0313], [110.2734, -7.2363], [111.2402, -7.4414], [112.2949, -7.5586],
                    [113.2617, -7.4414], [114.2285, -7.2363], [115.0488, -6.9434], [114.873, -7.3242],
                    [114.5508, -7.7051], [113.9453, -8.0859], [113.2031, -8.3789], [112.3242, -8.584],
                    [111.4453, -8.6133], [110.5078, -8.5254], [109.5703, -8.3789], [108.7207, -8.1152],
                    [107.9297, -7.7637], [107.2266, -7.3828], [106.5234, -6.9434], [105.8203, -6.5039],
                    [105.7031, -5.6836]
                ]]
            }
        },
        {
            type: 'Feature',
            properties: {
                name: 'Kalimantan',
                description: 'The Indonesian portion of Borneo island with rich rainforests and diverse wildlife.',
                population: 17000000,
                imageUrl: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
                destinations: ['Tanjung Puting', 'Derawan Islands', 'Pontianak', 'Banjarmasin']
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [108.8672, 1.4941], [109.8047, 0.9814], [110.7422, 0.5566], [111.6797, 0.2637],
                    [112.6172, 0.0586], [113.5547, -0.0586], [114.4922, -0.3516], [115.4297, -0.7764],
                    [116.3672, -1.2012], [117.1875, -1.7139], [117.7148, -2.4609], [117.9883, -3.3398],
                    [117.7734, -4.1309], [117.3047, -4.7461], [116.543, -4.9512], [115.6055, -4.2627],
                    [114.7559, -3.8379], [113.9063, -3.4131], [113.0566, -3.0762], [112.207, -2.7393],
                    [111.3574, -2.4023], [110.5078, -2.1533], [109.6582, -1.9043], [108.8086, -1.6553],
                    [107.959, -1.2891], [107.6367, -0.4102], [107.8516, 0.5273], [108.3203, 1.1426],
                    [108.8672, 1.4941]
                ]]
            }
        },
        {
            type: 'Feature',
            properties: {
                name: 'Sulawesi',
                description: 'A uniquely shaped island known for marine diversity and cultural heritage.',
                population: 19000000,
                imageUrl: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
                destinations: ['Toraja', 'Bunaken', 'Makassar', 'Wakatobi']
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [119.2676, 1.2305], [120.0586, 1.5234], [120.8496, 1.1426], [121.377, 0.5273],
                    [121.5527, -0.2344], [121.2012, -0.9375], [120.6738, -1.4062], [120.0586, -1.7578],
                    [119.4434, -2.2266], [119.0918, -2.9297], [118.8281, -3.6328], [118.5645, -4.3359],
                    [118.5059, -5.127], [118.8281, -5.8301], [119.3555, -6.3574], [120.0586, -6.5332],
                    [120.8496, -6.2695], [121.3184, -5.6543], [121.5234, -4.8047], [121.6406, -3.9551],
                    [121.9043, -3.1641], [122.2559, -2.373], [122.6074, -1.6699], [122.959, -0.9668],
                    [123.3105, -0.2637], [123.6621, 0.4395], [124.0137, 1.1426], [124.3652, 1.8457],
                    [124.541, 2.5488], [124.3652, 3.252], [123.8379, 3.6768], [123.1348, 3.5596],
                    [122.4316, 3.252], [121.7285, 2.9443], [121.0254, 2.6367], [120.3223, 2.3291],
                    [119.6191, 2.0215], [119.2676, 1.2305]
                ]]
            }
        },
        {
            type: 'Feature',
            properties: {
                name: 'Papua',
                description: 'The eastern portion of New Guinea with mountainous terrain and diverse ecosystems.',
                population: 4500000,
                imageUrl: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
                destinations: ['Raja Ampat', 'Baliem Valley', 'Jayapura', 'Asmat']
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [130.7813, -1.4062], [131.8359, -1.6113], [132.8906, -1.9922], [133.9453, -2.4609],
                    [134.9121, -2.9297], [135.8789, -3.252], [136.8457, -3.4277], [137.8125, -3.5449],
                    [138.7793, -3.6035], [139.7461, -3.5449], [140.7129, -3.4277], [141.6797, -3.252],
                    [142.6465, -3.0762], [143.4375, -3.4277], [143.8184, -4.1309], [143.9941, -4.9219],
                    [143.7598, -5.7129], [143.0859, -6.2109], [142.1484, -6.4746], [141.2109, -6.5332],
                    [140.2734, -6.416], [139.3359, -6.1816], [138.3984, -5.9473], [137.4609, -5.7129],
                    [136.5234, -5.5371], [135.5859, -5.4785], [134.6484, -5.4785], [133.7109, -5.4785],
                    [132.7734, -5.4199], [131.8359, -5.1855], [130.8984, -4.9512], [130.0195, -4.6582],
                    [129.5508, -3.8672], [129.6094, -3.0176], [130.166, -2.1094], [130.7813, -1.4062]
                ]]
            }
        },
        {
            type: 'Feature',
            properties: {
                name: 'Bali',
                description: 'Famous tourist destination known for beautiful beaches and rich cultural heritage.',
                population: 4300000,
                imageUrl: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
                destinations: ['Kuta', 'Ubud', 'Uluwatu', 'Seminyak']
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [114.4336, -8.1738], [114.8438, -8.2617], [115.2539, -8.3496], [115.664, -8.4375],
                    [115.752, -8.6426], [115.5762, -8.8477], [115.1367, -8.9355], [114.7266, -8.8477],
                    [114.4336, -8.6426], [114.4336, -8.1738]
                ]]
            }
        },
        {
            type: 'Feature',
            properties: {
                name: 'Lombok',
                description: 'Island east of Bali known for Mount Rinjani and beautiful beaches.',
                population: 3700000,
                imageUrl: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
                destinations: ['Gili Islands', 'Mount Rinjani', 'Kuta Lombok', 'Senggigi']
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [116.0156, -8.2617], [116.3965, -8.3203], [116.7773, -8.4375], [116.8945, -8.6426],
                    [116.7773, -8.8477], [116.3965, -8.9648], [116.0156, -8.8477], [115.8984, -8.6426],
                    [116.0156, -8.2617]
                ]]
            }
        },
        {
            type: 'Feature',
            properties: {
                name: 'Flores',
                description: 'Island known for Komodo dragons and diverse marine life.',
                population: 2100000,
                imageUrl: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
                destinations: ['Komodo National Park', 'Kelimutu', 'Labuan Bajo', 'Ende']
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [119.5313, -8.4082], [120.3223, -8.4961], [121.1133, -8.5254], [121.9043, -8.4961],
                    [122.0215, -8.7012], [121.7578, -8.9063], [120.9668, -9.0234], [120.1758, -9.0234],
                    [119.3848, -8.9063], [119.2676, -8.7012], [119.5313, -8.4082]
                ]]
            }
        },
        {
            type: 'Feature',
            properties: {
                name: 'Timor',
                description: 'Divided between Indonesia and East Timor, known for its mountainous terrain.',
                population: 2000000,
                imageUrl: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
                destinations: ['Kupang', 'Belu', 'Mount Mutis', 'Alor']
            },
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [123.6621, -8.7598], [124.3066, -8.8184], [124.9512, -9.0234], [125.5371, -9.3457],
                    [125.9766, -9.7266], [125.7129, -10.0195], [125.0684, -10.1074], [124.4238, -9.9316],
                    [123.8379, -9.668], [123.5156, -9.2871], [123.4277, -8.9063], [123.6621, -8.7598]
                ]]
            }
        },
        {
            type: 'Feature',
            properties: {
                name: 'Maluku',
                description: 'The Spice Islands with rich history and beautiful marine life.',
                population: 1900000,
                imageUrl: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg',
                destinations: ['Ambon', 'Banda Islands', 'Ternate', 'Tidore']
            },
            geometry: {
                type: 'MultiPolygon',
                coordinates: [
                    [[[128.8477, -3.252], [129.2285, -3.3984], [129.6094, -3.6914], [129.4336, -4.043],
                    [129.0527, -4.2188], [128.6719, -4.043], [128.5547, -3.6914], [128.8477, -3.252]]],
                    [[[127.8809, -3.252], [128.2617, -3.3984], [128.5547, -3.6914], [128.3789, -4.043],
                    [127.998, -4.2188], [127.6172, -4.043], [127.5, -3.6914], [127.8809, -3.252]]],
                    [[[126.9141, -3.252], [127.2949, -3.3984], [127.6758, -3.6914], [127.5, -4.043],
                    [127.1191, -4.2188], [126.7383, -4.043], [126.6211, -3.6914], [126.9141, -3.252]]]
                ]
            }
        }
    ]
};

export const mainIslands = ['Sumatra', 'Java', 'Kalimantan', 'Sulawesi', 'Papua', 'Bali', 'Lombok', 'Flores', 'Timor', 'Maluku'];

export const majorCities = [
    { name: 'Jakarta', coordinates: [106.8456, -6.2088], island: 'Java', isCapital: true },
    { name: 'Surabaya', coordinates: [112.7508, -7.2575], island: 'Java' },
    { name: 'Bandung', coordinates: [107.6191, -6.9175], island: 'Java' },
    { name: 'Medan', coordinates: [98.6722, 3.5952], island: 'Sumatra' },
    { name: 'Makassar', coordinates: [119.4144, -5.1477], island: 'Sulawesi' },
    { name: 'Semarang', coordinates: [110.4203, -7.0051], island: 'Java' },
    { name: 'Palembang', coordinates: [104.7754, -2.9761], island: 'Sumatra' },
    { name: 'Balikpapan', coordinates: [116.8625, -1.2379], island: 'Kalimantan' },
    { name: 'Denpasar', coordinates: [115.2126, -8.6705], island: 'Bali' },
    { name: 'Manado', coordinates: [124.8421, 1.4748], island: 'Sulawesi' },
    { name: 'Jayapura', coordinates: [140.7080, -2.5916], island: 'Papua' },
    { name: 'Ambon', coordinates: [128.1907, -3.6954], island: 'Maluku' },
    { name: 'Mataram', coordinates: [116.0669, -8.5833], island: 'Lombok' },
    { name: 'Kupang', coordinates: [123.6079, -10.1775], island: 'Timor' },
    { name: 'Labuan Bajo', coordinates: [119.8740, -8.4964], island: 'Flores' }
];

export const popularDestinations = [
    { name: 'Bali Beaches', coordinates: [115.1889, -8.7053], island: 'Bali', type: 'Beach' },
    { name: 'Borobudur Temple', coordinates: [110.2038, -7.6079], island: 'Java', type: 'Cultural' },
    { name: 'Komodo Island', coordinates: [119.4470, -8.5535], island: 'Flores', type: 'Nature' },
    { name: 'Lake Toba', coordinates: [98.8528, 2.6845], island: 'Sumatra', type: 'Nature' },
    { name: 'Raja Ampat', coordinates: [130.8797, -1.0743], island: 'Papua', type: 'Marine' },
    { name: 'Mount Bromo', coordinates: [112.9540, -7.9425], island: 'Java', type: 'Mountain' },
    { name: 'Gili Islands', coordinates: [116.0308, -8.3518], island: 'Lombok', type: 'Beach' },
    { name: 'Derawan Islands', coordinates: [118.2477, 2.2795], island: 'Kalimantan', type: 'Marine' },
    { name: 'Tanjung Puting', coordinates: [111.7048, -2.7637], island: 'Kalimantan', type: 'Wildlife' },
    { name: 'Bunaken', coordinates: [124.7600, 1.6179], island: 'Sulawesi', type: 'Marine' },
    { name: 'Banda Islands', coordinates: [129.9059, -4.5252], island: 'Maluku', type: 'Historical' },
    { name: 'Baliem Valley', coordinates: [138.9488, -4.0453], island: 'Papua', type: 'Culture' }
];
