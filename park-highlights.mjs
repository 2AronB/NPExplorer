// Editorial choices, researched against official NPS pages on 2026-10-28.
// These are options, never assigned activities or a promise that all fit a stay.
// Keep runtime IDs for joins only. Sources and caveats travel with each item.
const nps=(id,path='planyourvisit/placestogo.htm')=>`https://www.nps.gov/${id}/${path}`;
const records={};
function park(id,items,path='planyourvisit/placestogo.htm',caveat='Check current access and conditions before choosing an activity.'){
 records[id]={siteId:id,checkedAt:'2026-10-28',experiences:items.map(([title,description,url,note])=>({title,description,url:url||nps(id,path),caveat:note||caveat}))};
}
park('acad',[
 ['Park Loop Road and Cadillac Mountain','Granite summits, Atlantic coastline and the classic Mount Desert Island circuit.'],
 ['Jordan Pond and the carriage roads','Lake scenery and a different perspective on the island on foot or by bicycle.']
]);
park('arch',[
 ['Delicate Arch','The signature freestanding arch, with hiking and viewing choices.'],
 ['The Windows and Double Arch','A concentration of monumental sandstone arches.'],
 ['Devils Garden','Choose a trail through an arch-filled rock landscape.']
]);
park('badl',[
 ['Badlands Loop Road','Layered badland scenery from the park road and overlooks.'],
 ['Fossil Exhibit Trail','A short introduction to the fossil landscapes that define the park.']
],'planyourvisit/things2do.htm');
park('bibe',[
 ['Chisos Basin and Window View','Mountain scenery above the Chihuahuan Desert.'],
 ['Castolon Historic District','Desert landscapes and the human history of the Rio Grande region.']
]);
park('bisc',[
 ['Boca Chita Key','Boat access to an island with a landmark historic lighthouse.'],
 ['Maritime Heritage Trail','Explore shipwreck history by snorkeling where suitable.'],
 ['Jones Lagoon','Paddling among the park’s island and lagoon landscapes.']
],'planyourvisit/placestogo.htm','Research boat access, operator availability and water conditions.');
park('blca',[
 ['South Rim Drive and overlooks','Look down into the steep, dark-walled canyon from the developed rim.'],
 ['North Rim overlooks','A quieter perspective on the canyon from the opposite rim.']
],'planyourvisit/placestogo.htm','Rims have no connecting park road. Vehicle access is seasonal; check road status.');
park('brca',[
 ['Bryce Amphitheater','Take in the park’s defining hoodoo landscape from the rim.'],
 ['Queen’s Garden and Navajo trails','An optional descent among the hoodoos.',nps('brca','planyourvisit/faqs.htm'),'Choose a route suited to your group and check trail conditions before descending.']
]);
park('cany',[
 ['Island in the Sky overlooks','Expansive canyon views along the paved scenic drive.'],
 ['The Needles','Explore a landscape of sandstone spires on a suitable hiking route.']
],'planyourvisit/placestogo.htm','Districts are not linked by roads inside the park. Allow separate approaches; remote trips require more preparation.');
park('care',[
 ['Fruita','Explore the historic heart of the park and its red-rock setting.'],
 ['Waterpocket District','See the tilted rock layers of the Waterpocket Fold.'],
 ['Cathedral Valley','An optional remote journey into the park’s rugged northern landscape.']
],'planyourvisit/placestogo.htm','Research road and vehicle suitability before traveling beyond the developed Fruita area.');
park('cave',[
 ['Big Room','Experience the immense underground chamber on a self-guided route.'],
 ['Natural Entrance','An alternative walking approach into the cavern.'],
 ['Bat Flight Program','Consider the ranger program on the cavern’s emerging bats.']
],'planyourvisit/things2do.htm','Research cavern entry arrangements and the current bat-flight program before travel.');
park('chis',[
 ['Santa Cruz Island and Cavern Point','Island hiking and views over the Pacific.'],
 ['Anacapa Island and Inspiration Point','A dramatic island-chain panorama.']
],'planyourvisit/placestogo.htm','Research island-specific boat access and landing conditions. These are alternative islands, not one combined day.');
park('chir',[
 ['Bonita Canyon Drive and Massai Point','Drive through rock formations to a wide view of the Wonderland of Rocks.','https://www.nps.gov/thingstodo/bonita-canyon-drive.htm'],
 ['Echo Canyon','Walk among the park’s rock formations and grotto.','https://www.nps.gov/chir/planyourvisit/upload/2026_Park_Hiking_Guide_8x14_Remediated.pdf','Check the hiking guide and vehicle restrictions. Upper parking areas are unsuitable for trailers.']
]);
park('cong',[
 ['Old-growth forest boardwalk','See the park’s tall floodplain forest from the boardwalk.'],
 ['Cedar Creek paddle','Explore the forest from the water by canoe or kayak.']
],'planyourvisit/things2do.htm','Research water levels, current access and paddling arrangements.');
park('crla',[
 ['Scenic Rim Drive','See the deep-blue lake and caldera from multiple viewpoints.'],
 ['Rim Village','A first lake view and a walk through the historic rim district.']
]);
park('cuva',[
 ['Ohio & Erie Canal Towpath Trail','Walk or cycle through the valley’s canal landscape.'],
 ['Cuyahoga Valley Scenic Railroad','An optional rail perspective on the valley.']
],'planyourvisit/things2do.htm','Check trail access and the railroad’s current operating schedule and tickets.');
park('deva',[
 ['Badwater Basin','Experience the salt-flat landscape below sea level.'],
 ['Zabriskie Point','Take in the sculpted badlands from an overlook.']
],'faqs.htm','Research heat, road conditions and safe visiting hours for your travel dates.');
park('drto',[
 ['Fort Jefferson on Garden Key','Explore the great coastal fort surrounded by open water.'],
 ['Reefs and marine life','Consider snorkeling in suitable conditions around this remote marine park.']
],'planyourvisit/placestogo.htm','Research ferry, seaplane or private-boat access and weather. No transport is booked.');
park('ever',[
 ['Royal Palm and Anhinga Trail','A boardwalk introduction to wetland wildlife habitat.'],
 ['Shark Valley','Explore the wetland landscape, observation tower and tram options.'],
 ['Flamingo','See the park’s coastal side and research a boat outing.']
]);
park('jeff',[
 ['Tram ride to the top','See St. Louis from the Gateway Arch.'],
 ['Old Courthouse','Explore restored courtrooms and the history of Dred and Harriet Scott.']
],'index.htm','Research opening hours, tram tickets and accessibility needs.');
park('glac',[
 ['Going-to-the-Sun Road and Logan Pass','The Continental Divide and the park’s great alpine road.'],
 ['Lake McDonald at Apgar','Lakeshore scenery beneath Glacier’s mountains.']
],'planyourvisit/placestogo.htm','Check seasonal road access, vehicle size limits and current entry arrangements.');
park('grca',[
 ['South Rim and Mather Point','The classic first view into the Grand Canyon.'],
 ['Desert View Drive','A succession of canyon views toward the eastern South Rim.']
],'planyourvisit/placestogo.htm','Research current rim, road and shuttle conditions. A rim viewpoint does not imply a hike to the river.');
park('grte',[
 ['Jenny Lake','Explore the mountain-front lake by shore or research a boat outing.'],
 ['Teton scenic drives and wildlife viewing','Mountain panoramas and opportunities to watch wildlife from a safe distance.']
],'planyourvisit/things2do.htm','Check road, boat and trail access. Wildlife sightings are not guaranteed.');
park('grba',[
 ['Lehman Caves','A ranger-guided visit to the park’s decorated underground world.',nps('grba','planyourvisit/lehman-caves-tours.htm'),'A ticketed ranger tour is required. Research availability; nothing is reserved.'],
 ['Wheeler Peak Scenic Drive and bristlecone trails','Travel from desert to high country and ancient pines.',nps('grba','planyourvisit/wheeler-peak-scenic-drive.htm'),'Check snow, seasonal road access and vehicle restrictions before driving.']
]);
park('grsa',[
 ['Dunefield exploration and sand sledding','Experience the shifting dunes on foot or with suitable sand equipment.'],
 ['Medano Creek','Consider the creek experience when water conditions allow.'],
 ['Night sky over the dunes','Explore the park after dark with appropriate preparation.']
],'planyourvisit/things2do.htm','Check weather, sand temperatures and creek conditions. Water and suitable sledding conditions are not guaranteed.');
park('grsm',[
 ['Kuwohi and Newfound Gap','High-elevation views across the Smokies.'],
 ['Oconaluftee','Explore the southern gateway, trails and elk habitat.'],
 ['Deep Creek','A forest-and-waterfall perspective on the park.']
]);
park('gumo',[
 ['McKittrick Canyon','A celebrated canyon landscape with seasonal fall color.'],
 ['Pine Springs trails','Choose a hike from the mountain-front trailheads.'],
 ['Salt Basin Dunes','An optional trip to the park’s remote white dunes.']
],'planyourvisit/placestogo.htm','Carry supplies and fuel before arrival; the park has no gas or grocery services. Research route conditions.');
park('hosp',[
 ['Bathhouse Row and Fordyce Bathhouse','Explore the architecture and museum of the historic spa town.'],
 ['Thermal springs','Learn how the hot water shaped the park and research current bathing options.']
],'planyourvisit/things2do.htm');
park('indu',[
 ['Lake Michigan beaches','Experience the park’s defining freshwater shoreline.'],
 ['West Beach Succession Trail','Look over the dunes and lake from the trail.'],
 ['Miller Woods','Walk through oak savanna and wetlands toward Lake Michigan.']
]);
park('isro',[
 ['Rock Harbor and Scoville Point','Explore rocky Lake Superior shoreline from the eastern island portal.'],
 ['Greenstone Ridge and Mount Franklin','An optional hiking perspective from the island’s interior ridge.']
],'planyourvisit/placestogo.htm','Research ferry or seaplane access and hiking distances. A ridge hike is not automatically included in a short visit.');
park('jotr',[
 ['Keys View','Look across the Coachella Valley and surrounding mountains.'],
 ['Skull Rock','See one of the park’s signature sculpted rock formations.'],
 ['Black Rock Canyon','Explore a Joshua tree forest in the park’s northwestern area.']
]);
park('kica',[
 ['Grant Grove and General Grant Tree','Walk among giant sequoias in the Kings Canyon portion of the parks.',nps('seki')],
 ['Cedar Grove','Explore the canyon district that gives Kings Canyon its name.',nps('seki')]
]);
park('lavo',[
 ['Bumpass Hell and Sulphur Works','Choose a safe, open route to the park’s hydrothermal features.'],
 ['Manzanita Lake','A lake walk beneath Lassen’s volcanic skyline.'],
 ['Lassen Peak','An optional mountain hike for a prepared group.']
],'planyourvisit/placestogo.htm','Check snow, highway and trail conditions. Hydrothermal areas require staying on designated routes.');
park('maca',[
 ['Mammoth Cave tour','Explore part of the world’s longest known cave system.'],
 ['Green and Nolin rivers','See the surface landscape or research a paddle outing.']
],'planyourvisit/placestogo.htm','Research cave tour availability and suitability before travel; no tour is booked.');
park('meve',[
 ['Cliff Palace','See the great Ancestral Pueblo cliff dwelling from an overlook or research a guided tour.'],
 ['Mesa Top Loop','Explore mesa-top sites and cliff-dwelling views.'],
 ['Spruce Tree House overlooks','View the preserved dwelling from near the museum.']
],'planyourvisit/placestogo.htm','Guided cliff-dwelling tours require advance reservations. Spruce Tree House is viewed from overlooks, not entered.');
park('mora',[
 ['Paradise','Explore subalpine meadows and mountain views.'],
 ['Sunrise','A second high-country perspective on the mountain.'],
 ['Longmire','Historic buildings and lower-elevation forest walks.']
],'planyourvisit/placestogo.htm','Many roads and facilities open seasonally. Check road and trail status.');
park('neri',[
 ['New River Gorge Bridge','See the landmark crossing above the gorge.'],
 ['Grandview','Look across the river gorge from the rim.'],
 ['Sandstone Falls','Explore the New River’s broad waterfall landscape.']
]);
park('noca',[
 ['North Cascades Highway and Ross Lake','A road-accessible introduction to the mountain-and-lake park complex.'],
 ['Stehekin Valley','An optional journey into a remote valley of the park complex.']
],'planyourvisit/placestogo.htm','These places span the jointly managed park complex, including recreation areas. Research separate Stehekin access.');
park('olym',[
 ['Hoh Rain Forest and Hall of Mosses','Walk through the temperate rain forest.'],
 ['Hurricane Ridge','Mountain views and a choice of ridge walks.'],
 ['Rialto Beach','Experience the Pacific coast and, with suitable tides, tidepools.']
],'planyourvisit/day-hiking-at-olympic.htm','Check roads, trail access and coastal tide charts. Areas require separate approaches.');
park('pefo',[
 ['Painted Desert overlooks','See the layered colors of the badlands.'],
 ['Blue Mesa','Explore blue and purple geology by road or trail.'],
 ['Crystal Forest','See petrified logs and their quartz crystals along the loop.']
]);
park('pinn',[
 ['Talus caves','Explore the park’s distinctive boulder-formed cave environment when open.'],
 ['Rocky spires and condor watching','Take in the volcanic landscape and look for California condors.']
],'index.htm','Check cave and trail access before travel. Condor sightings are not guaranteed.');
park('redw',[
 ['Lady Bird Johnson Grove','Walk among the national park’s old-growth redwoods.'],
 ['Fern Canyon','An optional fern-lined canyon experience in the jointly managed state parks.'],
 ['Stout Grove','A giant-tree experience in Jedediah Smith Redwoods State Park.']
],'planyourvisit/hiking.htm','Research Fern Canyon access permits and seasonal bridges. These choices span national and state parks.');
park('romo',[
 ['Trail Ridge Road','Cross the park’s high-elevation alpine landscape.'],
 ['Bear Lake Road corridor','Choose a lake or mountain walk from the park’s classic eastern corridor.']
],'planyourvisit/placestogo.htm','Trail Ridge Road is seasonal. Research current road access and entry arrangements.');
park('sagu',[
 ['Tucson Mountain District','Experience the western district’s Sonoran Desert and towering saguaros.'],
 ['Rincon Mountain District','Explore the cactus landscape and trails in the eastern district.']
],'planyourvisit/things2do.htm','The districts are separated by Tucson. Plan separate approaches and check heat and trail conditions.');
park('sequ',[
 ['Giant Forest and General Sherman Tree','See the giant sequoias that define Sequoia National Park.',nps('seki')],
 ['Mineral King','An optional high-country alternative reached by a steep, winding road.',nps('seki'),'Research seasonal road access, vehicle suitability and trail conditions.']
]);
park('shen',[
 ['Big Meadows','Explore the open meadow landscape and surrounding park trails.'],
 ['Skyland','Mountain scenery from the park’s high ridge.'],
 ['Old Rag Mountain','An optional mountain outing requiring additional preparation.']
],'planyourvisit/placestogo.htm','Research current access, trail suitability and any required permits or tickets before choosing a hike.');
park('thro',[
 ['South Unit scenic drive and wildlife','See badlands and watch for wildlife from a safe distance.'],
 ['North Unit','Explore a different landscape along the Little Missouri River.'],
 ['Elkhorn Ranch','Visit the remote setting of Roosevelt’s home ranch.']
],'planyourvisit/placestogo.htm','Units require separate approaches. Check road conditions; wildlife sightings are not guaranteed.');
park('voya',[
 ['Rainy Lake boat outing','Research a guided boat trip into the lake country.'],
 ['Kabetogama or Ash River canoe outing','Explore water-based options from another park gateway.']
],'planyourvisit/things2do.htm','Research boat access, weather, equipment and operator schedules; no boat trip is booked.');
park('whsa',[
 ['Dunes Drive','Travel into the white gypsum dunefield.'],
 ['Dune walking or sand sledding','Experience the gypsum landscape in an open, permitted area.']
],'planyourvisit/conditions.htm','At research date a safety corridor restricted stopping along part of Dunes Drive and closed Interdune Boardwalk. Recheck alerts and missile-test closures.');
park('wica',[
 ['Ranger-guided cave tour','See the cave’s signature boxwork formations.',nps('wica','planyourvisit/guidedtours.htm'),'A ticketed ranger tour is required; research current availability and physical requirements.'],
 ['Prairie wildlife and surface trails','Explore the grassland world above the cave.',nps('wica','planyourvisit/things2do.htm'),'Check conditions and keep a safe distance from wildlife. Sightings are not guaranteed.']
]);
park('yell',[
 ['Old Faithful and Upper Geyser Basin','Watch a geyser and explore hydrothermal boardwalks.',nps('yell','planyourvisit/exploreoldfaithful.htm')],
 ['Grand Prismatic Spring','See the colors of Yellowstone’s hydrothermal landscape.',nps('yell','index.htm')],
 ['Grand Canyon of the Yellowstone','Explore views of the great canyon and waterfalls.',nps('yell','planyourvisit/placestogo.htm')],
 ['Lamar Valley wildlife watching','Look for wildlife in the open valley landscape.',nps('yell','index.htm'),'Keep your distance and use binoculars. Wildlife sightings are not guaranteed.']
]);
park('yose',[
 ['Yosemite Valley','Waterfalls, meadows and immense granite cliffs.'],
 ['Glacier Point','Look across the valley toward Half Dome and the high country.'],
 ['Mariposa Grove','Explore the park’s great grove of giant sequoias.'],
 ['Tuolumne Meadows and Tioga Road','An optional high-country chapter among meadows, peaks and domes.']
],'planyourvisit/placestogo.htm','Research seasonal road access, trail conditions and current entry arrangements.');
park('zion',[
 ['Zion Canyon','Take in the sandstone canyon and choose a suitable trail.',nps('zion','planyourvisit/hiking-in-zion.htm')],
 ['The Narrows','An optional river-canyon hike requiring careful conditions research.',nps('zion','planyourvisit/hiking-in-zion.htm'),'Research river, flood and trail conditions and any applicable permits. Do not assume it is safe or available.'],
 ['Kolob Canyons','Explore a different sandstone landscape in the northwest of the park.',nps('zion','planyourvisit/things2do.htm')]
]);
park('dena',[
 ['Denali Park Road by bus','Explore mountain and wildlife country using the park’s bus options.'],
 ['Sled dog kennels','Meet the park’s working sled dogs and research demonstration times.',nps('dena','planyourvisit/how-to-visit-the-kennels.htm'),'Kennel visiting hours and demonstrations vary by season.']
],'planyourvisit/things2do.htm','Check current road reach and bus operations. Wildlife and mountain visibility are not guaranteed.');
park('gaar',[
 ['Arrigetch Peaks','An optional wilderness journey among dramatic granite peaks.'],
 ['Wild and Scenic Rivers','Research a remote river or backpacking expedition in the Brooks Range.']
],'planyourvisit/placestogo.htm','These are remote wilderness expeditions. Research air access, guides, skills and contingency before choosing a route.');
park('glba',[
 ['Glacier Bay by boat','Experience the bay’s water-and-glacier landscape.'],
 ['Bartlett Cove','Explore the developed gateway, trails and shore.']
],'planyourvisit/placestogo.htm','Research travel to Gustavus, boat availability and weather. No sailing or glacier approach is promised.');
park('katm',[
 ['Brooks Camp bear viewing','Consider the river viewing platforms and bear habitat.',nps('katm','planyourvisit/bear-watching.htm'),'Research access and bear safety. Sightings depend on season and conditions.'],
 ['Valley of Ten Thousand Smokes','Explore options for seeing the volcanic landscape.',nps('katm','planyourvisit/things2do.htm'),'Research transport and tour availability separately from the modeled Brooks Camp approach.']
]);
park('kefj',[
 ['Exit Glacier','Explore trails to views of the glacier’s changing landscape.'],
 ['Coastal fjords','Research a boat trip among the fjords.'],
 ['Harding Icefield','An optional, more demanding high-country outing.']
],'planyourvisit/placestogo.htm','Check seasonal road access, marine weather, operator schedules and trail suitability.');
park('kova',[
 ['Great Kobuk Sand Dunes','See the great Arctic dune landscape.',nps('kova','learn/nature/great-kobuk-sand-dunes.htm')],
 ['Kobuk River float','Research a self-supported or guided river trip.',nps('kova','planyourvisit/things2do.htm')]
],'planyourvisit/things2do.htm','Remote access and wilderness logistics require separate research. No developed visitor facilities in the park.');
park('lacl',[
 ['Tanalian Falls trails','Explore the established trail network from Port Alsworth.'],
 ['Lake Clark','Research a kayak or fishing outing on the lake.'],
 ['Twin Lakes and Proenneke’s cabin','An optional remote journey to the historic cabin.']
],'planyourvisit/placestogo.htm','Research air access and activity logistics separately. The cabin requires a different approach from Port Alsworth.');
park('wrst',[
 ['Kennecott Mill Town','Explore the historic mining landscape on the approach to the glaciers.','https://www.nps.gov/places/root-glacier.htm'],
 ['Root Glacier','An optional guided glacier experience near Kennecott.','https://www.nps.gov/places/root-glacier.htm','Use current access guidance and consider an experienced guide. A 2026 reroute bypasses an unstable area; check current trail conditions.']
]);
park('hale',[
 ['Summit sunrise','Research a sunrise visit to the high volcanic summit.',nps('hale','planyourvisit/sunrise.htm'),'A sunrise reservation is required. No reservation is included in this itinerary.'],
 ['Summit wilderness trails','Choose a hike through the crater landscape.'],
 ['Kīpahulu District','Explore a different coastal side of Haleakalā.']
],'planyourvisit/things2do.htm','Summit and Kīpahulu are separate travel areas. Check weather, road and trail conditions.');
park('havo',[
 ['Kīlauea summit and Crater Rim Drive','Explore the summit’s volcanic landscape.'],
 ['Chain of Craters Road','Follow the slopes of Kīlauea toward the sea.'],
 ['Kahuku Unit','A separate landscape of volcanism, Hawaiian tradition and ranching history.']
],'planyourvisit/things2do.htm','Check alerts and air quality. Eruptions and lava visibility are not guaranteed.');
park('npsa',[
 ['Tutuila rainforest and coastal views','Explore the park’s rainforest-to-coast landscape.'],
 ['Ofu coral beaches','Research an optional visit to the park’s remote island beaches.']
],'planyourvisit/placestogo.htm','The park spans separate islands. Ofu is not included by a modeled Tutuila arrival; research additional transport and local customs.');
park('viis',[
 ['Trunk Bay snorkeling trail','Explore the underwater trail and beach in suitable sea conditions.'],
 ['Hawksnest reefs','Consider a second beach-and-snorkeling option.'],
 ['Cinnamon Bay','Experience the park’s long Caribbean beach.']
],'planyourvisit/placestogo.htm','Research ferry and island transport, water conditions and reef protection guidance.');
export const PARK_HIGHLIGHTS=Object.freeze(records);
