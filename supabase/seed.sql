-- CoralStone Properties — demo seed
-- Safe to re-run: agents upsert, properties skip on conflict.
-- Run AFTER schema.sql.

-- ===========================================================================
-- AGENTS
-- ===========================================================================
INSERT INTO public.agents (id, name, agency, avatar_url, verified, response_mins, completed_deals, phone, whatsapp)
VALUES
  ('ag_wanjiru','Wanjiru Kamau','Acacia Prime Realty',
   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=70',
   '["agent","agency"]',14,63,'+254700100200','254700100200'),
  ('ag_otieno','Brian Otieno','Lakebridge Properties',
   'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=70',
   '["agent","agency"]',22,41,'+254711220330','254711220330'),
  ('ag_achieng','Achieng'' Odhiambo','Coastline Homes',
   'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=70',
   '["agent","agency"]',9,88,'+254722330440','254722330440'),
  ('ag_mwangi','Peter Mwangi','Highland Land & Survey',
   'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=200&q=70',
   '["agent"]',35,27,'+254733440550','254733440550'),
  ('ag_riverbourne','Riverbourne Developments','Riverbourne Developments EA',
   'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=200&q=70',
   '["developer","agency"]',48,12,'+255744550660','255744550660'),
  ('ag_nakato','Sarah Nakato','Pearl Estates Kampala',
   'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=70',
   '["agent","agency"]',18,54,'+256772100200','256772100200'),
  ('ag_mugisha','Eric Mugisha','Kigali Prime Realty',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=70',
   '["agent","agency"]',12,47,'+250788330440','250788330440'),
  ('ag_salum','Salum Rashid','Zanzibar Coast Homes',
   'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&q=70',
   '["agent","agency"]',15,72,'+255715330440','255715330440')
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, agency=EXCLUDED.agency, avatar_url=EXCLUDED.avatar_url,
  verified=EXCLUDED.verified, response_mins=EXCLUDED.response_mins,
  completed_deals=EXCLUDED.completed_deals, phone=EXCLUDED.phone, whatsapp=EXCLUDED.whatsapp;

-- ===========================================================================
-- PROPERTIES  (all 28 — non-Kenya ones hidden by isCountryLive() until markets launch)
-- ===========================================================================

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_001','4-bed-townhouse-lavington-garden','4-bedroom garden townhouse with DSQ',
  'townhouse','sale','active',62000000,'KES','total',68000000,
  4,4,NULL,320,'sqm',NULL,NULL,'unfurnished',2021,
  'Kenya','Nairobi','Lavington','James Gichuru',-1.2833,36.7667,18000,'sectional',
  '["Borehole","Backup generator","Gated community","CCTV","Parking (2)","DSQ","Solar water heating"]',
  '["Family friendly","Backup water","Backup power","Pet friendly"]',
  '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=70"]',
  true,true,true,
  '[{"kind":"listing","verifiedOn":"2026-06-30"},{"kind":"agent","verifiedOn":"2026-01-12"},{"kind":"agency","verifiedOn":"2026-01-12"}]',
  'featured',
  'A calm, well-built townhouse in a small gated court off James Gichuru. Double-volume living opens to a private garden, the kitchen is fitted with quartz worktops, and the whole unit runs on borehole water with generator backup — so power and water cuts never reach you. Ten minutes to Lavington Mall and the Waiyaki Way expressway ramp.',
  true,'ag_wanjiru',
  '{"country":"Kenya","county":"Nairobi","area":"Lavington","security":85,"waterReliability":80,"powerReliability":90,"roadAccess":82}',
  '2026-06-28',2140,186,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_002','2-bed-apartment-kololo-furnished','Furnished 2-bed with Kololo skyline views',
  'apartment','rent','active',4500000,'UGX','month',NULL,
  2,2,NULL,118,'sqm',NULL,NULL,'furnished',2023,
  'Uganda','Kampala','Kololo','Acacia Avenue',0.335,32.59,400000,NULL,
  '["Swimming pool","Gym","Lift","Backup generator","Borehole","CCTV","Parking (1)","High-speed fibre"]',
  '["Backup water","Backup power"]',
  '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=70"]',
  true,true,false,
  '[{"kind":"listing","verifiedOn":"2026-07-02"},{"kind":"agent","verifiedOn":"2026-02-20"},{"kind":"agency","verifiedOn":"2026-02-20"}]',
  'spotlight',
  'Move-in-ready 2-bed on a high floor in leafy Kololo, with an open-plan living space and a balcony framing the Kampala skyline. Fully furnished to a neutral, hotel-grade standard. Rent includes access to the rooftop pool and gym; water and power are backed up building-wide.',
  true,'ag_nakato',
  '{"country":"Uganda","county":"Kampala","area":"Kololo","security":82,"waterReliability":74,"powerReliability":79,"roadAccess":80}',
  '2026-07-01',1580,121,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_003','half-acre-serviced-plot-kiambu','½-acre serviced residential plot',
  'land','sale','active',8900000,'KES','total',NULL,
  NULL,NULL,NULL,NULL,NULL,0.5,'acres',NULL,NULL,
  'Kenya','Kiambu','Kiambu Town','Ndumberi',-1.1714,36.8356,NULL,'freehold',
  '["Perimeter wall","Graded access road","Mains water","Electricity on site"]',
  '["Family friendly"]',
  '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1400&q=70"]',
  false,false,true,
  '[{"kind":"listing","verifiedOn":"2026-06-25"},{"kind":"title","verifiedOn":"2026-06-24"},{"kind":"agent","verifiedOn":"2026-03-01"}]',
  'featured',
  'A ready-to-build half-acre in a controlled-access scheme with beacons in place and a clean freehold title — confirmed by our title check. Graded murram road to the gate, mains water and power already reticulated. Ideal for a family home or a two-unit rental.',
  false,'ag_mwangi',
  '{"country":"Kenya","county":"Kiambu","area":"Kiambu Town","security":74,"waterReliability":70,"powerReliability":82,"roadAccess":79}',
  '2026-06-22',3020,240,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_004','5-bed-villa-karen-1-acre','5-bedroom villa on a mature acre',
  'house','sale','active',135000000,'KES','total',NULL,
  5,6,NULL,560,'sqm',1,'acres','unfurnished',2018,
  'Kenya','Nairobi','Karen','Miotoni',-1.3319,36.7062,25000,'freehold',
  '["Swimming pool","Borehole","Backup generator","Staff quarters","Gated","CCTV","Parking (4)","Mature garden"]',
  '["Family friendly","Pet friendly","Backup water","Backup power","Ground floor"]',
  '["https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=70"]',
  true,true,true,
  '[{"kind":"listing","verifiedOn":"2026-06-18"},{"kind":"title","verifiedOn":"2026-06-16"},{"kind":"agent","verifiedOn":"2026-02-10"},{"kind":"agency","verifiedOn":"2026-02-10"}]',
  'spotlight',
  'A gracious family villa set well back on a mature, hedged acre in Miotoni. Generous, light-filled reception rooms flow to a covered terrace, pool and lawn. Borehole and full generator backup, staff quarters, and a freehold title verified end to end.',
  true,'ag_wanjiru',
  '{"country":"Kenya","county":"Nairobi","area":"Karen","security":88,"waterReliability":68,"powerReliability":86,"roadAccess":74}',
  '2026-06-15',4120,358,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_005','grade-a-office-kigali-450sqm','Grade-A office suite, 450 sqm',
  'commercial','rent','active',6500000,'RWF','month',NULL,
  NULL,NULL,NULL,450,'sqm',NULL,NULL,NULL,2022,
  'Rwanda','Kigali','Kimihurura','KG 7 Avenue',-1.945,30.094,900000,NULL,
  '["Lift","Backup generator","Borehole","Fibre-ready","Ample parking","24/7 security","Fire suppression"]',
  '[]',
  '["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=70"]',
  true,false,false,
  '[{"kind":"listing","verifiedOn":"2026-07-03"},{"kind":"agent","verifiedOn":"2026-01-30"},{"kind":"agency","verifiedOn":"2026-01-30"}]',
  NULL,
  'An efficient full floor in a new Grade-A block in Kigali''s Kimihurura business district. Open-plan with two fitted meeting rooms, raised access flooring and dedicated fibre. Basement parking at a healthy 1:40 ratio, generator and backup water on the common services.',
  false,'ag_mugisha',
  '{"country":"Rwanda","county":"Kigali","area":"Kimihurura","security":92,"waterReliability":86,"powerReliability":90,"roadAccess":91}',
  '2026-07-02',940,47,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_006','off-plan-2-bed-dar-riverbourne','Off-plan 2-bed at Riverbourne Court',
  'off_plan','sale','active',260000000,'TZS','total',NULL,
  2,2,NULL,96,'sqm',NULL,NULL,'unfurnished',NULL,
  'Tanzania','Dar es Salaam','Msasani Peninsula','Msasani',-6.75,39.27,120000,'sectional',
  '["Swimming pool","Clubhouse","Backup generator","Borehole","Gated","CCTV","Children''s play area"]',
  '["Family friendly","Backup water","Backup power"]',
  '["https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1590725140246-20acdee442be?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=70"]',
  false,true,true,
  '[{"kind":"listing","verifiedOn":"2026-06-20"},{"kind":"developer","verifiedOn":"2026-05-01"},{"kind":"title","verifiedOn":"2026-05-01"}]',
  'featured',
  'A phase-two release at Riverbourne Court on the Msasani Peninsula in Dar es Salaam. Bright 2-beds with a covered balcony, priced for the current construction stage with a staged payment plan. Handover Q2 2027 — track construction milestones and instalments right here on the listing.',
  true,'ag_riverbourne',
  '{"country":"Tanzania","county":"Dar es Salaam","area":"Msasani Peninsula","security":79,"waterReliability":70,"powerReliability":76,"roadAccess":78}',
  '2026-06-19',2680,205,45,'2027-06-30'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_007','beachfront-3-bed-zanzibar-shortlet','Beachfront 3-bed short-let',
  'apartment','short_let','active',480000,'TZS','night',NULL,
  3,3,NULL,140,'sqm',NULL,NULL,'furnished',2020,
  'Tanzania','Zanzibar','Nungwi','Nungwi Beach',-5.726,39.296,NULL,NULL,
  '["Swimming pool","Beach access","Backup generator","Borehole","Air conditioning","Wi-Fi","Housekeeping"]',
  '["Family friendly","Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=70"]',
  true,false,false,
  '[{"kind":"listing","verifiedOn":"2026-07-04"},{"kind":"agent","verifiedOn":"2026-04-10"},{"kind":"agency","verifiedOn":"2026-04-10"}]',
  'spotlight',
  'A breezy, fully-serviced 3-bed a two-minute walk from the sand at Nungwi, on Zanzibar''s north coast. Air-conditioned bedrooms, a large sea-facing balcony and a shared pool. Nightly rate includes housekeeping and Wi-Fi; secure your dates with a mobile-money deposit.',
  false,'ag_salum',
  '{"country":"Tanzania","county":"Zanzibar","area":"Nungwi","security":84,"waterReliability":66,"powerReliability":72,"roadAccess":74}',
  '2026-07-03',1360,98,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_008','3-bed-maisonette-syokimau-gated','3-bed maisonette in gated estate',
  'house','sale','under_offer',14800000,'KES','total',NULL,
  3,3,NULL,180,'sqm',NULL,NULL,'unfurnished',2019,
  'Kenya','Machakos','Syokimau','Kola Sky',-1.3667,36.9333,6500,'leasehold',
  '["Gated community","Backup generator","Borehole","CCTV","Parking (2)","Playground","Perimeter wall"]',
  '["Family friendly","Pet friendly","Backup water"]',
  '["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1400&q=70"]',
  true,false,false,
  '[{"kind":"listing","verifiedOn":"2026-06-12"},{"kind":"agent","verifiedOn":"2026-03-15"}]',
  NULL,
  'A practical, well-priced maisonette in a managed gated estate minutes from the SGR terminus and Mombasa Road expressway. Three ensuite bedrooms, a private back yard, and estate-wide generator and borehole. Currently under offer — register interest to be next in line.',
  false,'ag_otieno',
  '{"country":"Kenya","county":"Machakos","area":"Syokimau","security":76,"waterReliability":66,"powerReliability":84,"roadAccess":86}',
  '2026-06-10',1990,143,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_009','1-bed-apartment-kilimani-investor','Investor 1-bed, high rental yield',
  'apartment','sale','active',6400000,'KES','total',6900000,
  1,1,NULL,62,'sqm',NULL,NULL,'unfurnished',2024,
  'Kenya','Nairobi','Kilimani','Argwings Kodhek',-1.2965,36.7889,7000,'sectional',
  '["Swimming pool","Gym","Lift","Backup generator","Borehole","CCTV","Parking (1)"]',
  '["Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=70"]',
  false,true,false,
  '[{"kind":"listing","verifiedOn":"2026-07-01"},{"kind":"agent","verifiedOn":"2026-02-20"},{"kind":"agency","verifiedOn":"2026-02-20"}]',
  NULL,
  'A compact, efficient 1-bed in a new managed block — the sort of unit that lets fast and holds its value. Strong short-let and long-let demand on this stretch of Kilimani; run the numbers with the yield tools before you enquire.',
  true,'ag_wanjiru',
  '{"country":"Kenya","county":"Nairobi","area":"Kilimani","security":78,"waterReliability":72,"powerReliability":88,"roadAccess":84}',
  '2026-06-29',2260,174,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_010','1-acre-commercial-plot-mombasa-road','1-acre commercial plot, Mombasa Rd',
  'land','sale','active',46000000,'KES','total',NULL,
  NULL,NULL,NULL,NULL,NULL,1,'acres',NULL,NULL,
  'Kenya','Machakos','Syokimau','Mombasa Road frontage',-1.3725,36.9412,NULL,'leasehold',
  '["Tarmac frontage","Mains water","Three-phase power","Perimeter wall"]',
  '[]',
  '["https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1400&q=70"]',
  false,false,true,
  '[{"kind":"listing","verifiedOn":"2026-06-27"},{"kind":"title","verifiedOn":"2026-06-26"},{"kind":"agent","verifiedOn":"2026-03-01"}]',
  NULL,
  'A rare full acre with direct tarmac frontage on the Mombasa Road service lane — zoned commercial, with three-phase power at the boundary. Leasehold with a long unexpired term, title verified. Suits a showroom, warehouse-office or fuel-and-retail development.',
  false,'ag_mwangi',
  '{"country":"Kenya","county":"Machakos","area":"Syokimau","security":76,"waterReliability":66,"powerReliability":84,"roadAccess":86}',
  '2026-06-25',1720,112,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_011','studio-apartment-westlands-rent','Modern studio, walk to Sarit',
  'apartment','rent','active',58000,'KES','month',NULL,
  0,1,NULL,40,'sqm',NULL,NULL,'semi_furnished',2023,
  'Kenya','Nairobi','Westlands','Rhapta Road',-1.2681,36.7972,5000,NULL,
  '["Lift","Backup generator","Borehole","CCTV","Rooftop terrace","Fibre-ready"]',
  '["Backup power","Backup water","Ground floor"]',
  '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=70"]',
  false,false,false,
  '[{"kind":"listing","verifiedOn":"2026-07-05"},{"kind":"agent","verifiedOn":"2026-01-30"},{"kind":"agency","verifiedOn":"2026-01-30"}]',
  NULL,
  'A smart, secure studio a short walk from Sarit Centre and the Westlands nightlife — ideal for a young professional. Semi-furnished with a fitted kitchenette; building has a lift, borehole, generator and a rooftop terrace.',
  false,'ag_otieno',
  '{"country":"Kenya","county":"Nairobi","area":"Westlands","security":80,"waterReliability":76,"powerReliability":92,"roadAccess":88}',
  '2026-07-04',810,52,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_012','off-plan-4-bed-karen-riverbourne','Off-plan 4-bed villa, Karen edge',
  'off_plan','sale','active',38500000,'KES','total',NULL,
  4,4,NULL,280,'sqm',0.25,'acres','unfurnished',NULL,
  'Kenya','Nairobi','Karen','Ngong Road edge',-1.3402,36.7189,14000,'freehold',
  '["Gated community","Clubhouse","Swimming pool","Backup generator","Borehole","CCTV","Jogging track"]',
  '["Family friendly","Pet friendly","Backup water","Backup power"]',
  '["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=70"]',
  false,true,true,
  '[{"kind":"listing","verifiedOn":"2026-06-22"},{"kind":"developer","verifiedOn":"2026-05-01"},{"kind":"title","verifiedOn":"2026-05-01"}]',
  'featured',
  'Detached 4-bed villas on their own quarter-acre freehold plots in a gated Karen-edge scheme. Double-height entrance, family kitchen and a DSQ, wrapped in a low-density estate with a clubhouse and pool. Reserve off-plan at the launch price with a staged plan.',
  true,'ag_riverbourne',
  '{"country":"Kenya","county":"Nairobi","area":"Karen","security":88,"waterReliability":68,"powerReliability":86,"roadAccess":74}',
  '2026-06-21',3410,289,30,'2027-12-15'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_013','3-bed-apartment-nakasero-kampala','3-bed apartment in Nakasero',
  'apartment','sale','active',850000000,'UGX','total',NULL,
  3,3,NULL,165,'sqm',NULL,NULL,'unfurnished',2022,
  'Uganda','Kampala','Nakasero','Kyadondo Road',0.3236,32.5811,350000,'leasehold',
  '["Lift","Backup generator","Borehole","CCTV","Parking (2)","Gym","High-speed fibre"]',
  '["Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=70"]',
  true,true,false,
  '[{"kind":"listing","verifiedOn":"2026-07-02"},{"kind":"agent","verifiedOn":"2026-03-05"},{"kind":"agency","verifiedOn":"2026-03-05"}]',
  'featured',
  'A bright 3-bed on Kyadondo Road in Nakasero, minutes from Kampala''s CBD. Open-plan living, a fitted kitchen and a private balcony, in a managed block with a lift, gym, generator and borehole. Walkable to embassies, schools and the golf course.',
  true,'ag_nakato',
  '{"country":"Uganda","county":"Kampala","area":"Nakasero","security":83,"waterReliability":76,"powerReliability":80,"roadAccess":82}',
  '2026-06-30',1440,96,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_014','4-bed-lakeside-house-munyonyo','4-bed lakeside house, Munyonyo',
  'house','sale','active',1500000000,'UGX','total',NULL,
  4,5,NULL,380,'sqm',0.25,'acres','unfurnished',2020,
  'Uganda','Kampala','Munyonyo','Bwebajja',0.25,32.61,300000,'freehold',
  '["Swimming pool","Borehole","Backup generator","Staff quarters","Gated","CCTV","Lake view"]',
  '["Family friendly","Pet friendly","Backup water","Backup power"]',
  '["https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=70"]',
  true,false,true,
  '[{"kind":"listing","verifiedOn":"2026-06-24"},{"kind":"title","verifiedOn":"2026-06-22"},{"kind":"agent","verifiedOn":"2026-03-05"}]',
  NULL,
  'A serene four-bedroom family home near the shores of Lake Victoria at Munyonyo. Generous reception rooms open to a pool and garden, with a self-contained DSQ, borehole and full generator backup. Freehold title, verified end to end.',
  false,'ag_nakato',
  '{"country":"Uganda","county":"Kampala","area":"Munyonyo","security":80,"waterReliability":78,"powerReliability":77,"roadAccess":79}',
  '2026-06-23',2010,158,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_015','4-bed-villa-nyarutarama-kigali','4-bed villa in Nyarutarama',
  'house','sale','active',420000000,'RWF','total',NULL,
  4,4,NULL,300,'sqm',0.2,'acres','unfurnished',2021,
  'Rwanda','Kigali','Nyarutarama','Lake View',-1.933,30.106,250000,'freehold',
  '["Swimming pool","Backup generator","Borehole","Gated","CCTV","Parking (3)","Garden"]',
  '["Family friendly","Pet friendly","Backup water","Backup power"]',
  '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=70"]',
  true,true,true,
  '[{"kind":"listing","verifiedOn":"2026-06-28"},{"kind":"title","verifiedOn":"2026-06-26"},{"kind":"agent","verifiedOn":"2026-02-18"},{"kind":"agency","verifiedOn":"2026-02-18"}]',
  'spotlight',
  'A crisp, modern villa in Nyarutarama, Kigali''s most sought-after residential quarter, overlooking the lake and golf course. Four ensuite bedrooms, a double-height living space, pool and mature garden — on a clean freehold title in a secure, well-run neighbourhood.',
  true,'ag_mugisha',
  '{"country":"Rwanda","county":"Kigali","area":"Nyarutarama","security":93,"waterReliability":88,"powerReliability":91,"roadAccess":92}',
  '2026-06-27',2380,191,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_016','2-bed-apartment-masaki-dar','Furnished 2-bed in Masaki',
  'apartment','rent','active',2800000,'TZS','month',NULL,
  2,2,NULL,110,'sqm',NULL,NULL,'furnished',2023,
  'Tanzania','Dar es Salaam','Masaki','Toure Drive',-6.742,39.276,150000,NULL,
  '["Swimming pool","Gym","Lift","Backup generator","Borehole","CCTV","Air conditioning"]',
  '["Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=70"]',
  true,false,false,
  '[{"kind":"listing","verifiedOn":"2026-07-04"},{"kind":"agent","verifiedOn":"2026-04-12"},{"kind":"agency","verifiedOn":"2026-04-12"}]',
  'featured',
  'A fully-furnished 2-bed on Toure Drive in Masaki, a short walk to the peninsula''s cafes and the ocean. Sea-breeze balcony, air-conditioned bedrooms and access to a shared pool and gym; power and water backed up building-wide.',
  false,'ag_salum',
  '{"country":"Tanzania","county":"Dar es Salaam","area":"Masaki","security":81,"waterReliability":72,"powerReliability":78,"roadAccess":80}',
  '2026-07-03',1180,74,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_017','2-bed-apartment-kimihurura-kigali-rent','Modern 2-bed in Kimihurura',
  'apartment','rent','active',1200000,'RWF','month',NULL,
  2,2,NULL,95,'sqm',NULL,NULL,'furnished',2024,
  'Rwanda','Kigali','Kimihurura','KG 5 Avenue',-1.947,30.092,120000,NULL,
  '["Lift","Backup generator","Borehole","CCTV","Parking (1)","High-speed fibre"]',
  '["Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=70"]',
  false,true,false,
  '[{"kind":"listing","verifiedOn":"2026-07-05"},{"kind":"agent","verifiedOn":"2026-02-18"},{"kind":"agency","verifiedOn":"2026-02-18"}]',
  NULL,
  'A smart, move-in-ready 2-bed in Kimihurura, central Kigali — walkable to restaurants and the business district. Neutral finishes, a fitted kitchen and a balcony, in a managed block with a lift, generator and borehole.',
  false,'ag_mugisha',
  '{"country":"Rwanda","county":"Kigali","area":"Kimihurura","security":92,"waterReliability":86,"powerReliability":90,"roadAccess":91}',
  '2026-07-04',820,51,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_018','garden-wedding-venue-karen','Garden wedding & events lawn, Karen',
  'venue','short_let','active',180000,'KES','day',NULL,
  NULL,NULL,500,4000,'sqm',NULL,NULL,NULL,NULL,
  'Kenya','Nairobi','Karen','Karen Country',-1.329,36.712,NULL,NULL,
  '["Weddings","Graduation parties","Birthdays & hangouts","Corporate events","Manicured lawn","Marquee & staging","Bridal suite","Catering kitchen","Ample parking (120)","Backup generator","Standby water","PA & sound system","Event security"]',
  '["Family friendly","Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=70"]',
  true,false,true,
  '[{"kind":"listing","verifiedOn":"2026-07-08"},{"kind":"agent","verifiedOn":"2026-03-02"},{"kind":"agency","verifiedOn":"2026-03-02"}]',
  'spotlight',
  'A landscaped one-acre garden in Karen that owners hire out by the day for weddings, graduations and milestone celebrations. Level lawn for up to 500 guests, a bridal suite, marquee and staging, a prep kitchen for your caterer, generator and water backup, and gated parking for 120 cars. Reserve a date with a mobile-money deposit.',
  true,'ag_wanjiru',
  '{"country":"Kenya","county":"Nairobi","area":"Karen","security":88,"waterReliability":68,"powerReliability":86,"roadAccess":74}',
  '2026-07-07',2140,176,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_019','rooftop-party-lounge-westlands','Rooftop party & hangout lounge, Westlands',
  'venue','short_let','active',90000,'KES','day',NULL,
  NULL,NULL,150,380,'sqm',NULL,NULL,NULL,NULL,
  'Kenya','Nairobi','Westlands','Parklands Road',-1.2649,36.8039,NULL,NULL,
  '["Birthdays & hangouts","Graduation parties","Baby showers","Corporate mixers","City skyline views","Covered bar","Lounge seating","DJ booth & sound","Ambient lighting","Backup generator","Lift access"]',
  '["Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=70"]',
  true,false,false,
  '[{"kind":"listing","verifiedOn":"2026-07-09"},{"kind":"agent","verifiedOn":"2026-04-01"},{"kind":"agency","verifiedOn":"2026-04-01"}]',
  'featured',
  'A covered rooftop lounge over Westlands, hired by the day for birthdays, graduation parties, baby showers and after-work hangouts. Skyline views, a built-in bar, a DJ booth with sound and ambient lighting, comfortably holds 150 guests. Generator-backed with lift access straight to the deck.',
  false,'ag_achieng',
  '{"country":"Kenya","county":"Nairobi","area":"Westlands","security":80,"waterReliability":76,"powerReliability":92,"roadAccess":88}',
  '2026-07-08',1560,121,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_020','graduation-banquet-hall-kololo','Graduation & banquet hall, Kololo',
  'venue','short_let','active',2400000,'UGX','day',NULL,
  NULL,NULL,400,620,'sqm',NULL,NULL,NULL,NULL,
  'Uganda','Kampala','Kololo','Acacia Avenue',0.336,32.588,NULL,NULL,
  '["Graduation parties","Weddings","Conferences & AGMs","Corporate events","Air-conditioned hall","Stage & podium","Projector & screen","Catering kitchen","Round tables & chairs","Backup generator","Parking (80)"]',
  '["Family friendly","Backup power"]',
  '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=70"]',
  true,false,false,
  '[{"kind":"listing","verifiedOn":"2026-07-06"},{"kind":"agent","verifiedOn":"2026-03-05"},{"kind":"agency","verifiedOn":"2026-03-05"}]',
  NULL,
  'An air-conditioned banquet hall on Acacia Avenue, Kololo, leased by the day for graduations, weddings, conferences and corporate galas. Seats 400 with a stage, podium, projector and full catering kitchen; tables and chairs included. Generator backup and secure parking for 80 cars.',
  false,'ag_nakato',
  '{"country":"Uganda","county":"Kampala","area":"Kololo","security":82,"waterReliability":74,"powerReliability":79,"roadAccess":80}',
  '2026-07-05',980,63,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_021','lakeside-events-lawn-munyonyo','Lakeside events lawn, Munyonyo',
  'venue','short_let','active',3200000,'UGX','day',NULL,
  NULL,NULL,700,5200,'sqm',NULL,NULL,NULL,NULL,
  'Uganda','Kampala','Munyonyo','Bwebajja',0.25,32.61,NULL,NULL,
  '["Weddings","Graduation parties","Concerts & festivals","Corporate events","Lake Victoria frontage","Open lawn","Marquee & staging","Generator power","Standby water","Boat access","Parking (200)"]',
  '["Family friendly","Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=70"]',
  true,false,true,
  '[{"kind":"listing","verifiedOn":"2026-07-07"},{"kind":"agent","verifiedOn":"2026-03-05"},{"kind":"agency","verifiedOn":"2026-03-05"}]',
  'featured',
  'A sweeping lakefront lawn at Munyonyo on the shores of Lake Victoria, available by the day for large weddings, graduations, concerts and corporate festivals. Room for 700 guests, marquee and staging, generator power and standby water, boat access and parking for 200.',
  false,'ag_nakato',
  '{"country":"Uganda","county":"Kampala","area":"Munyonyo","security":80,"waterReliability":78,"powerReliability":77,"roadAccess":79}',
  '2026-07-06',1720,138,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_022','beachfront-party-venue-nungwi','Beachfront party venue, Nungwi',
  'venue','short_let','active',900000,'TZS','day',NULL,
  NULL,NULL,250,1600,'sqm',NULL,NULL,NULL,NULL,
  'Tanzania','Zanzibar','Nungwi','Nungwi Beach',-5.726,39.296,NULL,NULL,
  '["Beach weddings","Birthdays & hangouts","Sundowner parties","Corporate retreats","Private beachfront","Beach bar","Bonfire & lighting","Sound system","Backup generator","Changing rooms"]',
  '["Family friendly","Backup power"]',
  '["https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=70"]',
  true,false,true,
  '[{"kind":"listing","verifiedOn":"2026-07-08"},{"kind":"agent","verifiedOn":"2026-04-10"},{"kind":"agency","verifiedOn":"2026-04-10"}]',
  'spotlight',
  'A private stretch of Nungwi beach on Zanzibar''s north coast, hired by the day for beach weddings, sundowner parties, birthdays and corporate retreats. Beach bar, bonfire and lighting, sound system and changing rooms, for up to 250 guests. Generator-backed; secure your date with a mobile-money deposit.',
  false,'ag_salum',
  '{"country":"Tanzania","county":"Zanzibar","area":"Nungwi","security":84,"waterReliability":66,"powerReliability":72,"roadAccess":74}',
  '2026-07-07',1310,104,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_023','rooftop-conference-space-kimihurura','Conference & corporate event space, Kimihurura',
  'venue','short_let','active',650000,'RWF','day',NULL,
  NULL,NULL,200,340,'sqm',NULL,NULL,NULL,NULL,
  'Rwanda','Kigali','Kimihurura','KG 5 Avenue',-1.947,30.092,NULL,NULL,
  '["Conferences & AGMs","Corporate events","Product launches","Graduation parties","Tiered seating","Stage & podium","Projector & screen","High-speed fibre","Breakout lounge","Backup generator","Parking (60)"]',
  '["Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=70"]',
  true,true,false,
  '[{"kind":"listing","verifiedOn":"2026-07-09"},{"kind":"agent","verifiedOn":"2026-02-18"},{"kind":"agency","verifiedOn":"2026-02-18"}]',
  NULL,
  'A polished top-floor event space in Kimihurura, central Kigali, leased by the day for conferences, AGMs, product launches, graduations and corporate functions. Tiered seating for 200, stage and podium, projector, fast fibre and a breakout lounge. Generator-backed with parking for 60.',
  true,'ag_mugisha',
  '{"country":"Rwanda","county":"Kigali","area":"Kimihurura","security":92,"waterReliability":86,"powerReliability":90,"roadAccess":91}',
  '2026-07-08',760,48,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_024','lakeside-wedding-gardens-naivasha','Lakeside wedding & outdoor gardens, Naivasha',
  'venue','short_let','active',150000,'KES','day',NULL,
  NULL,NULL,600,6000,'sqm',NULL,NULL,NULL,NULL,
  'Kenya','Nakuru','Naivasha','Moi South Lake',-0.78,36.36,NULL,NULL,
  '["Wedding venue","Outdoor ceremonies","Garden receptions","Corporate retreats","Lake Naivasha frontage","Open lawn","Marquee & staging","Bridal suite","Catering kitchen","Backup generator","Standby water","Parking (150)"]',
  '["Family friendly","Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=70"]',
  true,false,true,
  '[{"kind":"listing","verifiedOn":"2026-07-10"},{"kind":"agent","verifiedOn":"2026-03-02"},{"kind":"agency","verifiedOn":"2026-03-02"}]',
  'featured',
  'Rolling lakefront lawns on the shores of Lake Naivasha, a favourite Kenyan destination for outdoor weddings and garden receptions. Hired by the day for up to 600 guests, with a bridal suite, marquee and staging, a caterer''s kitchen, generator and water backup, and parking for 150. Reserve a date with a mobile-money deposit.',
  true,'ag_wanjiru',
  '{"country":"Kenya","county":"Nakuru","area":"Naivasha","security":74,"waterReliability":71,"powerReliability":80,"roadAccess":78}',
  '2026-07-09',1480,129,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_025','botanical-garden-wedding-venue-entebbe','Botanical lakeside wedding & outdoor venue, Entebbe',
  'venue','short_let','active',2800000,'UGX','day',NULL,
  NULL,NULL,500,5000,'sqm',NULL,NULL,NULL,NULL,
  'Uganda','Wakiso','Entebbe','Botanical Beach',0.048,32.463,NULL,NULL,
  '["Wedding venue","Outdoor ceremonies","Garden receptions","Lake Victoria frontage","Botanical gardens","Marquee & staging","Bridal suite","Catering kitchen","Backup generator","Standby water","Parking (120)"]',
  '["Family friendly","Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=70"]',
  true,false,true,
  '[{"kind":"listing","verifiedOn":"2026-07-10"},{"kind":"agent","verifiedOn":"2026-03-05"},{"kind":"agency","verifiedOn":"2026-03-05"}]',
  NULL,
  'A lakeside lawn set among Entebbe''s botanical gardens on the edge of Lake Victoria — one of Uganda''s most-booked outdoor wedding settings. Room for 500 guests, a bridal suite, marquee and staging, a prep kitchen for your caterer, and generator and water backup, with parking for 120.',
  false,'ag_nakato',
  '{"country":"Uganda","county":"Wakiso","area":"Entebbe","security":85,"waterReliability":80,"powerReliability":82,"roadAccess":86}',
  '2026-07-09',1240,101,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_026','highland-garden-wedding-venue-arusha','Highland garden wedding & outdoor venue, Arusha',
  'venue','short_let','active',800000,'TZS','day',NULL,
  NULL,NULL,400,3500,'sqm',NULL,NULL,NULL,NULL,
  'Tanzania','Arusha','Arusha','Njiro',-3.386,36.683,NULL,NULL,
  '["Wedding venue","Outdoor ceremonies","Garden receptions","Safari-view lawn","Mount Meru backdrop","Marquee & staging","Bridal suite","Catering kitchen","Backup generator","Standby water","Parking (90)"]',
  '["Family friendly","Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=70"]',
  true,false,true,
  '[{"kind":"listing","verifiedOn":"2026-07-10"},{"kind":"agent","verifiedOn":"2026-04-10"},{"kind":"agency","verifiedOn":"2026-04-10"}]',
  NULL,
  'Terraced highland gardens in Arusha with a Mount Meru backdrop — a cool-climate favourite for outdoor weddings and garden receptions, and a natural base for safari-season celebrations. Seats 400 outdoors with a bridal suite, marquee and staging, caterer''s kitchen, and generator and water backup; parking for 90.',
  false,'ag_salum',
  '{"country":"Tanzania","county":"Arusha","area":"Arusha","security":82,"waterReliability":74,"powerReliability":76,"roadAccess":79}',
  '2026-07-09',990,72,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_027','hillside-garden-wedding-venue-nyarutarama','Hillside garden wedding & outdoor venue, Nyarutarama',
  'venue','short_let','active',700000,'RWF','day',NULL,
  NULL,NULL,450,3200,'sqm',NULL,NULL,NULL,NULL,
  'Rwanda','Kigali','Nyarutarama','Golf View',-1.933,30.106,NULL,NULL,
  '["Wedding venue","Outdoor ceremonies","Garden receptions","Hilltop city views","Manicured lawn","Marquee & staging","Bridal suite","Catering kitchen","Backup generator","Standby water","Parking (80)"]',
  '["Family friendly","Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=70"]',
  true,true,false,
  '[{"kind":"listing","verifiedOn":"2026-07-10"},{"kind":"agent","verifiedOn":"2026-02-18"},{"kind":"agency","verifiedOn":"2026-02-18"}]',
  'featured',
  'A manicured hillside garden in Nyarutarama, Kigali''s smartest quarter, overlooking the golf course and city — a serene outdoor setting for weddings and garden receptions. Holds 450 guests with a bridal suite, marquee and staging, caterer''s kitchen and generator backup; parking for 80.',
  true,'ag_mugisha',
  '{"country":"Rwanda","county":"Kigali","area":"Nyarutarama","security":93,"waterReliability":88,"powerReliability":91,"roadAccess":92}',
  '2026-07-09',1060,84,NULL,NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.properties (id,slug,title,type,intent,status,price,currency,price_period,previous_price,beds,baths,capacity,size,size_unit,plot_size,plot_size_unit,furnishing,year_built,country,county,area,estate,lat,lng,service_charge,title_type,amenities,lifestyle,images,has_video,has_3d_tour,has_drone,verified,boost_tier,description,ai_assisted_description,agent_id,area_guide,listed_on,view_count,save_count,completion_percent,handover_date)
VALUES (
  'p_028','lake-kivu-outdoor-events-venue-rubavu','Lake Kivu lakeside outdoor events venue, Rubavu',
  'venue','short_let','active',850000,'RWF','day',NULL,
  NULL,NULL,600,4800,'sqm',NULL,NULL,NULL,NULL,
  'Rwanda','Rubavu','Rubavu (Lake Kivu)','Kivu Shores',-1.679,29.26,NULL,NULL,
  '["Outdoor concerts","Wedding venue","Festivals & galas","Corporate retreats","Lake Kivu frontage","Open lawn","Private beach & jetty","Marquee & staging","Backup generator","Standby water","Parking (150)"]',
  '["Family friendly","Backup power","Backup water"]',
  '["https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=70"]',
  true,false,true,
  '[{"kind":"listing","verifiedOn":"2026-07-10"},{"kind":"agent","verifiedOn":"2026-02-18"},{"kind":"agency","verifiedOn":"2026-02-18"}]',
  'spotlight',
  'An open lakefront lawn with a private beach on Lake Kivu at Rubavu — Rwanda''s premier outdoor setting for weddings, concerts, festivals and corporate retreats. Room for 600 guests, marquee and staging, jetty access, generator and water backup, and parking for 150.',
  false,'ag_mugisha',
  '{"country":"Rwanda","county":"Rubavu","area":"Rubavu (Lake Kivu)","security":90,"waterReliability":84,"powerReliability":86,"roadAccess":85}',
  '2026-07-09',1390,118,NULL,NULL
) ON CONFLICT (id) DO NOTHING;
