/**
 * Sample data for Magento products
 * 
 * This file contains example data structures for configurable and bundle products.
 */
export const sampleData = [
    {
        id: "1",
        name: "Classic T-Shirt",
        sku: "TS-CLASSIC",
        type: "configurable",
        price: 19.99,
        status: "enabled",
        _children: [
            {
                id: "1-1",
                name: "Classic T-Shirt - Black, S",
                sku: "TS-CLASSIC-BLACK-S",
                color: "Black",
                size: "S",
                price: 19.99,
                qty: 100
            },
            {
                id: "1-2",
                name: "Classic T-Shirt - Black, M",
                sku: "TS-CLASSIC-BLACK-M",
                color: "Black",
                size: "M",
                price: 19.99,
                qty: 150
            },
            {
                id: "1-3",
                name: "Classic T-Shirt - White, S",
                sku: "TS-CLASSIC-WHITE-S",
                color: "White",
                size: "S",
                price: 19.99,
                qty: 75
            }
        ]
    },
    {
        id: "2",
        name: "Gaming PC Bundle",
        sku: "PC-BUNDLE-GAMING",
        type: "bundle",
        price: 1499.99,
        status: "enabled",
        _children: [
            {
                id: "2-1",
                name: "CPU Option",
                sku: "PC-BUNDLE-CPU",
                option_title: "Processor",
                is_required: true,
                qty: 1,
                price: 299.99
            },
            {
                id: "2-2",
                name: "GPU Option",
                sku: "PC-BUNDLE-GPU",
                option_title: "Graphics Card",
                is_required: true,
                qty: 1,
                price: 499.99
            },
            {
                id: "2-3",
                name: "RAM Option",
                sku: "PC-BUNDLE-RAM",
                option_title: "Memory",
                is_required: true,
                qty: 2,
                price: 129.99
            },
            {
                id: "2-4",
                name: "Storage Option",
                sku: "PC-BUNDLE-SSD",
                option_title: "SSD Storage",
                is_required: true,
                qty: 1,
                price: 149.99
            }
        ]
    },
    {
        id: "3",
        name: "Smartphone Accessories Bundle",
        sku: "PHONE-BUNDLE",
        type: "bundle",
        price: 79.99,
        status: "enabled",
        _children: [
            {
                id: "3-1",
                name: "Phone Case",
                sku: "PHONE-CASE",
                option_title: "Phone Case",
                is_required: false,
                qty: 1,
                price: 24.99
            },
            {
                id: "3-2",
                name: "Screen Protector",
                sku: "PHONE-SCREEN",
                option_title: "Screen Protector",
                is_required: true,
                qty: 2,
                price: 9.99
            },
            {
                id: "3-3",
                name: "Charging Cable",
                sku: "PHONE-CABLE",
                option_title: "USB-C Cable",
                is_required: true,
                qty: 1,
                price: 14.99
            }
        ]
    }
]; 