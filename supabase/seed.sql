-- =====================================================================
-- CAMPUSMART AI - SEED DATA (DEFAULT CATEGORIES & DEMO ITEMS)
-- =====================================================================

-- Insert Default Categories
INSERT INTO public.categories (id, name, slug, icon, description, display_order)
VALUES 
    ('c1111111-1111-1111-1111-111111111101', 'Electronics & Gadgets', 'electronics', 'Laptop', 'Laptops, tablets, headphones, chargers, and accessories', 1),
    ('c1111111-1111-1111-1111-111111111102', 'Books & Study Material', 'books', 'BookOpen', 'Textbooks, course packets, notes, and prep manuals', 2),
    ('c1111111-1111-1111-1111-111111111103', 'Engineering & Lab Equipment', 'engineering-tools', 'Wrench', 'Calculators, lab coats, circuit boards, multimeter, drawing kits', 3),
    ('c1111111-1111-1111-1111-111111111104', 'Dorm & Hostel Essentials', 'dorm-essentials', 'Home', 'Mini fridges, lamps, storage racks, mattress toppers, kettles', 4),
    ('c1111111-1111-1111-1111-111111111105', 'Bicycles & Campus Transport', 'bicycles', 'Bike', 'Road bikes, mountain bikes, skateboards, e-scooters, locks', 5),
    ('c1111111-1111-1111-1111-111111111106', 'Furniture & Room Decor', 'furniture', 'Armchair', 'Study chairs, desks, bean bags, shelves, posters', 6),
    ('c1111111-1111-1111-1111-111111111107', 'Clothing & Campus Gear', 'clothing', 'Shirt', 'College hoodies, winter jackets, formal wear for fairs', 7),
    ('c1111111-1111-1111-1111-111111111108', 'Sports & Fitness Equipment', 'sports', 'Trophy', 'Gym weights, tennis rackets, footballs, yoga mats', 8),
    ('c1111111-1111-1111-1111-111111111109', 'Other Essentials', 'other', 'Package', 'Miscellaneous campus necessities and supplies', 9)
ON CONFLICT (slug) DO NOTHING;
