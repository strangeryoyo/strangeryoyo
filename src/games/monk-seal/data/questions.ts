import { Question, QuestionCategory, Difficulty } from '../types';

export const questions: Question[] = [
  // === OCEANS (IDs 1-12) ===
  { id: 1, category: 'oceans', difficulty: 1, question: 'How many oceans are there on Earth?', options: ['3', '4', '5', '7'], correctIndex: 2, explanation: 'There are 5 oceans: Pacific, Atlantic, Indian, Southern, and Arctic.' },
  { id: 2, category: 'oceans', difficulty: 1, question: 'Which is the largest ocean?', options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'], correctIndex: 1, explanation: 'The Pacific Ocean covers about one-third of Earth\'s surface!' },
  { id: 3, category: 'oceans', difficulty: 1, question: 'What percentage of Earth\'s surface is covered by water?', options: ['50%', '60%', '71%', '85%'], correctIndex: 2, explanation: 'About 71% of Earth is covered by water, mostly saltwater oceans.' },
  { id: 4, category: 'oceans', difficulty: 2, question: 'What is the deepest point in the ocean called?', options: ['Grand Canyon', 'Mariana Trench', 'Bermuda Triangle', 'Great Barrier Reef'], correctIndex: 1, explanation: 'The Mariana Trench in the Pacific is nearly 11,000 meters deep!' },
  { id: 5, category: 'oceans', difficulty: 2, question: 'Which ocean is the warmest?', options: ['Pacific', 'Atlantic', 'Indian', 'Southern'], correctIndex: 2, explanation: 'The Indian Ocean is the warmest ocean, with surface temperatures often above 28\u00b0C.' },
  { id: 6, category: 'oceans', difficulty: 2, question: 'What causes ocean tides?', options: ['Wind', 'The Moon\'s gravity', 'Earthquakes', 'Fish swimming'], correctIndex: 1, explanation: 'The Moon\'s gravitational pull causes the rise and fall of ocean tides.' },
  { id: 7, category: 'oceans', difficulty: 1, question: 'Which ocean is the smallest?', options: ['Indian', 'Southern', 'Atlantic', 'Arctic'], correctIndex: 3, explanation: 'The Arctic Ocean is the smallest and shallowest of the five oceans.' },
  { id: 8, category: 'oceans', difficulty: 3, question: 'What is the average depth of the ocean?', options: ['1,200 m', '2,500 m', '3,688 m', '5,000 m'], correctIndex: 2, explanation: 'The average ocean depth is about 3,688 meters (12,100 feet).' },
  { id: 9, category: 'oceans', difficulty: 2, question: 'What is a coral atoll?', options: ['A type of wave', 'A ring-shaped reef', 'An underwater cave', 'A deep trench'], correctIndex: 1, explanation: 'An atoll is a ring-shaped coral reef that encircles a lagoon.' },
  { id: 10, category: 'oceans', difficulty: 3, question: 'What are hydrothermal vents?', options: ['Air holes in ice', 'Hot water jets on the ocean floor', 'Volcanic islands', 'Whale blowholes'], correctIndex: 1, explanation: 'Hydrothermal vents release superheated water from beneath the ocean floor and support unique ecosystems.' },
  { id: 11, category: 'oceans', difficulty: 1, question: 'What makes ocean water salty?', options: ['Fish', 'Dissolved minerals and salts', 'Sand', 'Seaweed'], correctIndex: 1, explanation: 'Rivers carry dissolved salts and minerals from rocks into the ocean over millions of years.' },
  { id: 12, category: 'oceans', difficulty: 3, question: 'What is the thermohaline circulation?', options: ['Wind patterns', 'Global ocean current driven by temperature and salt', 'Tidal waves', 'Whale migration'], correctIndex: 1, explanation: 'The thermohaline circulation is a global "conveyor belt" of ocean currents driven by differences in water temperature and salinity.' },

  // === MARINE LIFE (IDs 13-24) ===
  { id: 13, category: 'marine-life', difficulty: 1, question: 'What is the largest animal on Earth?', options: ['Elephant', 'Great White Shark', 'Blue Whale', 'Giant Squid'], correctIndex: 2, explanation: 'Blue whales can grow up to 30 meters long and weigh 200 tonnes!' },
  { id: 14, category: 'marine-life', difficulty: 1, question: 'How do fish breathe underwater?', options: ['Lungs', 'Gills', 'Skin', 'They hold their breath'], correctIndex: 1, explanation: 'Fish use gills to extract dissolved oxygen from water.' },
  { id: 15, category: 'marine-life', difficulty: 2, question: 'What is a group of fish called?', options: ['Herd', 'Pack', 'School', 'Flock'], correctIndex: 2, explanation: 'A group of fish swimming together is called a school or shoal.' },
  { id: 16, category: 'marine-life', difficulty: 2, question: 'Which sea creature has three hearts?', options: ['Starfish', 'Octopus', 'Seahorse', 'Jellyfish'], correctIndex: 1, explanation: 'Octopuses have three hearts: two pump blood to the gills, one pumps it to the body.' },
  { id: 17, category: 'marine-life', difficulty: 1, question: 'Are dolphins mammals or fish?', options: ['Fish', 'Mammals', 'Reptiles', 'Amphibians'], correctIndex: 1, explanation: 'Dolphins are mammals \u2014 they breathe air, are warm-blooded, and nurse their young.' },
  { id: 18, category: 'marine-life', difficulty: 3, question: 'What is bioluminescence?', options: ['Bright colored scales', 'Light produced by living organisms', 'Reflection of sunlight', 'Glow from radioactive water'], correctIndex: 1, explanation: 'Many deep-sea creatures produce their own light through chemical reactions in their bodies.' },
  { id: 19, category: 'marine-life', difficulty: 2, question: 'How do sea turtles navigate across oceans?', options: ['They follow other fish', 'Earth\'s magnetic field', 'Ocean currents only', 'Sonar'], correctIndex: 1, explanation: 'Sea turtles can sense Earth\'s magnetic field and use it as a natural compass.' },
  { id: 20, category: 'marine-life', difficulty: 1, question: 'What do sea otters use to crack open shells?', options: ['Their teeth', 'Rocks', 'Other shells', 'Coral'], correctIndex: 1, explanation: 'Sea otters float on their backs and use rocks as tools to crack open shellfish!' },
  { id: 21, category: 'marine-life', difficulty: 3, question: 'What is the symbiotic relationship between clownfish and anemones?', options: ['Parasitic', 'Mutualistic', 'Commensal', 'Predatory'], correctIndex: 1, explanation: 'Both benefit: the clownfish gets protection while the anemone gets food scraps and cleaning.' },
  { id: 22, category: 'marine-life', difficulty: 2, question: 'How long can a sperm whale hold its breath?', options: ['10 minutes', '30 minutes', '90 minutes', '4 hours'], correctIndex: 2, explanation: 'Sperm whales can hold their breath for up to 90 minutes during deep dives!' },
  { id: 23, category: 'marine-life', difficulty: 1, question: 'What does a starfish use to move?', options: ['Fins', 'Tiny tube feet', 'Its tail', 'Water jets'], correctIndex: 1, explanation: 'Starfish have hundreds of tiny tube feet on their underside that work like suction cups.' },
  { id: 24, category: 'marine-life', difficulty: 3, question: 'What is the fastest fish in the ocean?', options: ['Tuna', 'Swordfish', 'Sailfish', 'Mako Shark'], correctIndex: 2, explanation: 'Sailfish can reach speeds of up to 110 km/h (68 mph)!' },

  // === POLLUTION (IDs 25-36) ===
  { id: 25, category: 'pollution', difficulty: 1, question: 'What is the Great Pacific Garbage Patch?', options: ['A recycling center', 'A huge area of floating trash', 'A landfill in the Pacific', 'A coral reef'], correctIndex: 1, explanation: 'It\'s a massive collection of floating plastic debris in the North Pacific Ocean.' },
  { id: 26, category: 'pollution', difficulty: 1, question: 'How long does a plastic bottle take to decompose in the ocean?', options: ['10 years', '50 years', '450 years', '1,000 years'], correctIndex: 2, explanation: 'A plastic bottle can take around 450 years to break down in the ocean!' },
  { id: 27, category: 'pollution', difficulty: 2, question: 'What are microplastics?', options: ['Tiny robots', 'Plastic pieces smaller than 5mm', 'Biodegradable plastic', 'Plastic wrap'], correctIndex: 1, explanation: 'Microplastics are tiny fragments less than 5mm that come from broken-down larger plastics.' },
  { id: 28, category: 'pollution', difficulty: 2, question: 'How many tons of plastic enter the ocean each year?', options: ['100,000', '1 million', '8 million', '50 million'], correctIndex: 2, explanation: 'About 8 million tons of plastic waste enters the ocean every year.' },
  { id: 29, category: 'pollution', difficulty: 1, question: 'What do sea turtles sometimes mistake plastic bags for?', options: ['Fish', 'Jellyfish', 'Seaweed', 'Coral'], correctIndex: 1, explanation: 'Floating plastic bags look like jellyfish, a favorite food of sea turtles.' },
  { id: 30, category: 'pollution', difficulty: 3, question: 'What is ocean acidification?', options: ['Water turning into acid', 'CO2 making seawater more acidic', 'Pollution from factories', 'Volcanic eruptions'], correctIndex: 1, explanation: 'When the ocean absorbs excess CO2 from the atmosphere, it becomes more acidic, harming shellfish and coral.' },
  { id: 31, category: 'pollution', difficulty: 2, question: 'What is a "ghost net"?', options: ['A fishing net made of cobwebs', 'An abandoned fishing net in the ocean', 'A net for catching ghosts', 'A decorative net'], correctIndex: 1, explanation: 'Ghost nets are fishing nets that have been lost or abandoned, continuing to trap marine life.' },
  { id: 32, category: 'pollution', difficulty: 1, question: 'Which item is found most often in beach cleanups?', options: ['Glass bottles', 'Cigarette butts', 'Shoes', 'Fishing line'], correctIndex: 1, explanation: 'Cigarette butts are the #1 item found during beach cleanups worldwide.' },
  { id: 33, category: 'pollution', difficulty: 3, question: 'What is an "oil spill boom"?', options: ['An explosion', 'A floating barrier to contain oil', 'A type of whale song', 'An oil rig'], correctIndex: 1, explanation: 'Booms are floating barriers placed on water to contain and control oil spills.' },
  { id: 34, category: 'pollution', difficulty: 2, question: 'What is eutrophication?', options: ['Clean water', 'Excess nutrients causing algae overgrowth', 'Frozen ocean', 'Water evaporation'], correctIndex: 1, explanation: 'Excess fertilizer runoff causes algae blooms that deplete oxygen and create "dead zones."' },
  { id: 35, category: 'pollution', difficulty: 1, question: 'What happens when animals eat plastic?', options: ['Nothing', 'They get stronger', 'It can block their stomachs and harm them', 'They digest it'], correctIndex: 2, explanation: 'Plastic can block digestive systems, cause starvation, and release toxic chemicals.' },
  { id: 36, category: 'pollution', difficulty: 3, question: 'How does noise pollution affect marine life?', options: ['It doesn\'t', 'It disrupts communication and navigation', 'It makes them faster', 'It helps them hide'], correctIndex: 1, explanation: 'Underwater noise from ships and sonar can interfere with whale and dolphin communication and echolocation.' },

  // === RECYCLING (IDs 37-48) ===
  { id: 37, category: 'recycling', difficulty: 1, question: 'What does the three-arrow recycling symbol mean?', options: ['Throw away', 'Reduce, reuse, recycle', 'Danger', 'Made of plastic'], correctIndex: 1, explanation: 'The three arrows represent the cycle of reducing waste, reusing items, and recycling materials.' },
  { id: 38, category: 'recycling', difficulty: 1, question: 'Which of these can be recycled?', options: ['Styrofoam cups', 'Aluminum cans', 'Used tissues', 'Broken mirrors'], correctIndex: 1, explanation: 'Aluminum cans are one of the most recyclable materials and can be recycled endlessly!' },
  { id: 39, category: 'recycling', difficulty: 2, question: 'How many times can glass be recycled?', options: ['Once', '5 times', '10 times', 'Infinitely'], correctIndex: 3, explanation: 'Glass can be recycled over and over without any loss in quality!' },
  { id: 40, category: 'recycling', difficulty: 2, question: 'What is "upcycling"?', options: ['Throwing things up', 'Making new products from waste', 'Burning trash', 'Burying waste'], correctIndex: 1, explanation: 'Upcycling transforms waste materials into new products of higher value or quality.' },
  { id: 41, category: 'recycling', difficulty: 1, question: 'Which bin does paper usually go in?', options: ['Red', 'Blue', 'Black', 'Green'], correctIndex: 1, explanation: 'In most recycling systems, paper goes in the blue bin.' },
  { id: 42, category: 'recycling', difficulty: 3, question: 'What is a circular economy?', options: ['A round factory', 'An economy that eliminates waste by reusing resources', 'Trading in circles', 'A type of currency'], correctIndex: 1, explanation: 'A circular economy designs out waste, keeps products in use, and regenerates natural systems.' },
  { id: 43, category: 'recycling', difficulty: 2, question: 'What can recycled plastic bottles be turned into?', options: ['Only new bottles', 'Clothing and fabric', 'Nothing useful', 'Food'], correctIndex: 1, explanation: 'Recycled plastic bottles can be turned into polyester fabric for clothing, carpets, and more!' },
  { id: 44, category: 'recycling', difficulty: 1, question: 'What is composting?', options: ['Burning waste', 'Breaking down organic waste into soil', 'Recycling metal', 'Cleaning water'], correctIndex: 1, explanation: 'Composting turns food scraps and yard waste into nutrient-rich soil for gardens.' },
  { id: 45, category: 'recycling', difficulty: 3, question: 'What percentage of ocean plastic comes from land-based sources?', options: ['20%', '50%', '80%', '95%'], correctIndex: 2, explanation: 'About 80% of ocean plastic pollution originates from land-based sources like rivers and coastal areas.' },
  { id: 46, category: 'recycling', difficulty: 2, question: 'What is a refill station?', options: ['A gas station', 'A place to refill reusable containers', 'A water fountain', 'A battery charger'], correctIndex: 1, explanation: 'Refill stations let you refill containers with products like soap and detergent, reducing packaging waste.' },
  { id: 47, category: 'recycling', difficulty: 1, question: 'Which is better for the environment: paper or plastic bags?', options: ['Paper', 'Plastic', 'Reusable bags', 'No difference'], correctIndex: 2, explanation: 'Reusable bags are the best choice \u2014 one reusable bag can replace hundreds of disposable ones!' },
  { id: 48, category: 'recycling', difficulty: 3, question: 'What is "extended producer responsibility"?', options: ['Longer work hours', 'Makers responsible for product\'s entire lifecycle', 'Extra warranties', 'More products'], correctIndex: 1, explanation: 'EPR makes manufacturers responsible for the environmental impact of their products from creation to disposal.' },

  // === MONK SEALS (IDs 49-60) ===
  { id: 49, category: 'monk-seals', difficulty: 1, question: 'Where do Hawaiian monk seals live?', options: ['Arctic Ocean', 'Hawaiian Islands', 'Mediterranean Sea', 'Amazon River'], correctIndex: 1, explanation: 'Hawaiian monk seals are found only in the Hawaiian Islands \u2014 they\'re endemic to Hawaii!' },
  { id: 50, category: 'monk-seals', difficulty: 1, question: 'Are Hawaiian monk seals endangered?', options: ['No, very common', 'Yes, critically endangered', 'Extinct', 'Only slightly rare'], correctIndex: 1, explanation: 'Hawaiian monk seals are critically endangered with about 1,400 individuals remaining.' },
  { id: 51, category: 'monk-seals', difficulty: 2, question: 'Why are they called "monk" seals?', options: ['They live in monasteries', 'Their head folds look like a monk\'s hood', 'They\'re very quiet', 'They only eat vegetables'], correctIndex: 1, explanation: 'The folds of skin on their head resemble a monk\'s cowl or hood.' },
  { id: 52, category: 'monk-seals', difficulty: 2, question: 'How long can a Hawaiian monk seal hold its breath?', options: ['2 minutes', '5 minutes', '20 minutes', '1 hour'], correctIndex: 2, explanation: 'Monk seals can hold their breath for up to 20 minutes while diving for food.' },
  { id: 53, category: 'monk-seals', difficulty: 1, question: 'What do Hawaiian monk seals eat?', options: ['Only seaweed', 'Fish, squid, and octopus', 'Plankton', 'Other seals'], correctIndex: 1, explanation: 'Monk seals eat a variety of seafood including fish, squid, octopus, and crustaceans.' },
  { id: 54, category: 'monk-seals', difficulty: 3, question: 'How many species of monk seals exist today?', options: ['1', '2', '3', '4'], correctIndex: 1, explanation: 'Only 2 species survive: Hawaiian and Mediterranean. The Caribbean monk seal went extinct in the 1950s.' },
  { id: 55, category: 'monk-seals', difficulty: 2, question: 'What is the biggest threat to monk seals?', options: ['Cold weather', 'Habitat loss and human disturbance', 'Other seals', 'Too much food'], correctIndex: 1, explanation: 'Habitat loss, fishing gear entanglement, and human disturbance are their biggest threats.' },
  { id: 56, category: 'monk-seals', difficulty: 1, question: 'What should you do if you see a monk seal on the beach?', options: ['Pet it', 'Take a selfie with it', 'Stay at least 50 feet away', 'Feed it'], correctIndex: 2, explanation: 'Keep at least 50 feet (15 meters) away. Disturbing monk seals is actually illegal!' },
  { id: 57, category: 'monk-seals', difficulty: 3, question: 'How long is the gestation period for a monk seal?', options: ['3 months', '6 months', '9 months', '12 months'], correctIndex: 2, explanation: 'Monk seal mothers are pregnant for about 9 months, similar to humans!' },
  { id: 58, category: 'monk-seals', difficulty: 2, question: 'What is a monk seal pup\'s fur color at birth?', options: ['White', 'Black', 'Brown', 'Spotted gray'], correctIndex: 1, explanation: 'Monk seal pups are born with black fur that gradually lightens as they grow.' },
  { id: 59, category: 'monk-seals', difficulty: 1, question: 'How much can an adult monk seal weigh?', options: ['50 lbs', '100 lbs', '400-600 lbs', '2,000 lbs'], correctIndex: 2, explanation: 'Adult Hawaiian monk seals typically weigh between 400-600 pounds (180-270 kg).' },
  { id: 60, category: 'monk-seals', difficulty: 3, question: 'What Hawaiian name is given to the monk seal?', options: ['Honu', '\u02bbIlio-holo-i-ka-uaua', 'Nai\'a', 'Kohola'], correctIndex: 1, explanation: '\u02bbIlio-holo-i-ka-uaua means "dog that runs in rough water" in Hawaiian.' },

  // === ADDITIONAL OCEANS (IDs 61-68) ===
  { id: 61, category: 'oceans', difficulty: 1, question: 'What is the saltiest body of water on Earth?', options: ['Dead Sea', 'Pacific Ocean', 'Lake Michigan', 'Amazon River'], correctIndex: 0, explanation: 'The Dead Sea is about 10 times saltier than the ocean!' },
  { id: 62, category: 'oceans', difficulty: 2, question: 'What causes waves in the ocean?', options: ['Fish swimming', 'Wind blowing across the surface', 'The Moon', 'Underwater volcanoes'], correctIndex: 1, explanation: 'Wind energy transfers to the water surface, creating waves that can travel thousands of miles.' },
  { id: 63, category: 'oceans', difficulty: 3, question: 'What percentage of the ocean floor has been mapped in detail?', options: ['About 5%', 'About 25%', 'About 50%', 'About 80%'], correctIndex: 1, explanation: 'Only about 25% of the ocean floor has been mapped with modern sonar technology.' },
  { id: 64, category: 'oceans', difficulty: 2, question: 'What is a tsunami?', options: ['A very large wave caused by underwater earthquakes', 'A type of whale', 'An ocean current', 'A tropical storm'], correctIndex: 0, explanation: 'Tsunamis are massive waves triggered by undersea earthquakes, volcanic eruptions, or landslides.' },
  { id: 65, category: 'oceans', difficulty: 1, question: 'What color does the ocean appear from space?', options: ['Green', 'Blue', 'Gray', 'Clear'], correctIndex: 1, explanation: 'The ocean appears blue because water absorbs red light and reflects blue light back to our eyes.' },
  { id: 66, category: 'oceans', difficulty: 3, question: 'What is the Mid-Atlantic Ridge?', options: ['A whale migration route', 'An underwater mountain range', 'A deep trench', 'A shipping lane'], correctIndex: 1, explanation: 'The Mid-Atlantic Ridge is a massive underwater mountain chain where tectonic plates are pulling apart.' },
  { id: 67, category: 'oceans', difficulty: 2, question: 'How much of Earth\'s oxygen comes from the ocean?', options: ['About 10%', 'About 30%', 'About 50%', 'About 90%'], correctIndex: 2, explanation: 'Marine plants like phytoplankton produce about 50% of the oxygen we breathe!' },
  { id: 68, category: 'oceans', difficulty: 1, question: 'What is a coral reef made of?', options: ['Rocks', 'Sand', 'Tiny living animals', 'Seaweed'], correctIndex: 2, explanation: 'Coral reefs are built by tiny animals called coral polyps that create hard calcium carbonate skeletons.' },

  // === ADDITIONAL MARINE LIFE (IDs 69-76) ===
  { id: 69, category: 'marine-life', difficulty: 1, question: 'What is the largest type of shark?', options: ['Great White', 'Hammerhead', 'Whale Shark', 'Tiger Shark'], correctIndex: 2, explanation: 'Whale sharks can grow up to 12 meters long, but they only eat plankton!' },
  { id: 70, category: 'marine-life', difficulty: 2, question: 'How do dolphins sleep?', options: ['They don\'t sleep', 'Half their brain sleeps at a time', 'They sleep on the ocean floor', 'They sleep floating on the surface'], correctIndex: 1, explanation: 'Dolphins sleep with one half of their brain at a time so they can keep breathing and watch for predators.' },
  { id: 71, category: 'marine-life', difficulty: 3, question: 'How old can a Greenland shark live?', options: ['50 years', '100 years', '250 years', '400+ years'], correctIndex: 3, explanation: 'Greenland sharks are the longest-lived vertebrates, potentially living over 400 years!' },
  { id: 72, category: 'marine-life', difficulty: 1, question: 'What is a baby whale called?', options: ['A pup', 'A calf', 'A fry', 'A kit'], correctIndex: 1, explanation: 'Baby whales are called calves, just like baby cows!' },
  { id: 73, category: 'marine-life', difficulty: 2, question: 'How many arms does a squid have?', options: ['6', '8', '10', '12'], correctIndex: 2, explanation: 'Squid have 8 arms plus 2 longer tentacles, making 10 limbs total.' },
  { id: 74, category: 'marine-life', difficulty: 3, question: 'What is the most venomous marine animal?', options: ['Stonefish', 'Box Jellyfish', 'Blue-ringed Octopus', 'Sea Snake'], correctIndex: 1, explanation: 'The box jellyfish has venom potent enough to be lethal to humans within minutes.' },
  { id: 75, category: 'marine-life', difficulty: 1, question: 'Do seahorses have stomachs?', options: ['Yes, a large one', 'No', 'Only babies do', 'They have two'], correctIndex: 1, explanation: 'Seahorses have no stomach! Food passes through their digestive system so quickly they must eat almost constantly.' },
  { id: 76, category: 'marine-life', difficulty: 2, question: 'Which parent carries seahorse babies?', options: ['The mother', 'The father', 'Both parents', 'Neither, eggs float freely'], correctIndex: 1, explanation: 'Male seahorses have a pouch where they carry and give birth to baby seahorses!' },

  // === ADDITIONAL POLLUTION (IDs 77-84) ===
  { id: 77, category: 'pollution', difficulty: 1, question: 'What is the most common type of ocean trash?', options: ['Glass', 'Metal', 'Plastic', 'Paper'], correctIndex: 2, explanation: 'Plastic makes up about 80% of all marine debris found in the ocean.' },
  { id: 78, category: 'pollution', difficulty: 2, question: 'What is a "dead zone" in the ocean?', options: ['An area with no water', 'An area with too little oxygen for life', 'A frozen section', 'A very deep area'], correctIndex: 1, explanation: 'Dead zones are areas where oxygen levels are so low that most marine life cannot survive.' },
  { id: 79, category: 'pollution', difficulty: 3, question: 'How long does it take for a fishing line to decompose?', options: ['5 years', '50 years', '200 years', '600 years'], correctIndex: 3, explanation: 'Fishing line can take up to 600 years to break down in the ocean!' },
  { id: 80, category: 'pollution', difficulty: 1, question: 'What happens to most plastic in the ocean?', options: ['It dissolves', 'Fish eat it all', 'It breaks into smaller pieces', 'It sinks immediately'], correctIndex: 2, explanation: 'Plastic doesn\'t truly decompose \u2014 it breaks into smaller and smaller microplastics that persist for centuries.' },
  { id: 81, category: 'pollution', difficulty: 2, question: 'What is "light pollution" in the ocean?', options: ['Glowing plankton', 'Artificial lights disrupting marine life', 'Sunburn on fish', 'Reflection off plastic'], correctIndex: 1, explanation: 'Coastal lights confuse sea turtles, disrupt fish behavior, and attract creatures away from their habitats.' },
  { id: 82, category: 'pollution', difficulty: 3, question: 'What are "nurdles"?', options: ['Baby turtles', 'Small pre-production plastic pellets', 'A type of seaweed', 'Ocean foam'], correctIndex: 1, explanation: 'Nurdles are tiny plastic pellets used to make plastic products. Billions spill into oceans during transport.' },
  { id: 83, category: 'pollution', difficulty: 1, question: 'How many marine animals are harmed by plastic each year?', options: ['Hundreds', 'Thousands', 'Hundreds of thousands', 'Over 1 million'], correctIndex: 3, explanation: 'Over 1 million marine animals are killed by plastic pollution every year.' },
  { id: 84, category: 'pollution', difficulty: 2, question: 'What is ballast water pollution?', options: ['Flooding from storms', 'Ships releasing water with foreign species', 'Water from melting icebergs', 'Sewage overflow'], correctIndex: 1, explanation: 'Ships take in water for balance and release it elsewhere, spreading invasive species to new environments.' },

  // === ADDITIONAL RECYCLING (IDs 85-92) ===
  { id: 85, category: 'recycling', difficulty: 1, question: 'What does "reduce" mean in the 3 R\'s?', options: ['Make things smaller', 'Use less stuff in the first place', 'Lower the temperature', 'Cut things in half'], correctIndex: 1, explanation: 'Reducing means consuming less \u2014 it\'s the most effective way to decrease waste!' },
  { id: 86, category: 'recycling', difficulty: 2, question: 'Can pizza boxes be recycled?', options: ['Always', 'Never', 'Only if clean, not if greasy', 'Only the lid'], correctIndex: 2, explanation: 'Grease contaminates paper recycling. Clean parts can be recycled, greasy parts should be composted.' },
  { id: 87, category: 'recycling', difficulty: 3, question: 'What is "wishcycling"?', options: ['Recycling while making a wish', 'Putting non-recyclable items in recycling hoping they\'ll be recycled', 'Donating to charity', 'Composting'], correctIndex: 1, explanation: 'Wishcycling contaminates recycling streams and can cause entire batches to be sent to landfill.' },
  { id: 88, category: 'recycling', difficulty: 1, question: 'Which material takes longest to decompose?', options: ['Paper', 'Banana peel', 'Glass bottle', 'Cotton shirt'], correctIndex: 2, explanation: 'A glass bottle can take over 1 million years to decompose, but it can be recycled infinitely!' },
  { id: 89, category: 'recycling', difficulty: 2, question: 'What is a "zero waste" lifestyle?', options: ['Never buying anything', 'Producing as little trash as possible', 'Only eating organic food', 'Living without electricity'], correctIndex: 1, explanation: 'Zero waste aims to send nothing to landfills by reducing, reusing, recycling, and composting.' },
  { id: 90, category: 'recycling', difficulty: 3, question: 'How much energy does recycling aluminum save compared to making new?', options: ['25%', '50%', '75%', '95%'], correctIndex: 3, explanation: 'Recycling aluminum saves 95% of the energy needed to make it from raw materials!' },
  { id: 91, category: 'recycling', difficulty: 1, question: 'Should you rinse containers before recycling?', options: ['No, never', 'Yes, a quick rinse helps', 'Only glass ones', 'Only on Tuesdays'], correctIndex: 1, explanation: 'A quick rinse removes food residue that could contaminate other recyclables.' },
  { id: 92, category: 'recycling', difficulty: 2, question: 'What is e-waste?', options: ['Electronic waste like old phones and computers', 'Expired food', 'Empty containers', 'Energy waste'], correctIndex: 0, explanation: 'E-waste is the fastest growing waste stream. Many components contain toxic materials that need special recycling.' },

  // === ADDITIONAL MONK SEALS (IDs 93-100) ===
  { id: 93, category: 'monk-seals', difficulty: 1, question: 'How long do monk seal mothers nurse their pups?', options: ['1 week', '5-6 weeks', '6 months', '1 year'], correctIndex: 1, explanation: 'Mothers nurse their pups for about 5-6 weeks, losing up to 1/3 of their body weight in the process!' },
  { id: 94, category: 'monk-seals', difficulty: 2, question: 'What is the main predator of Hawaiian monk seals?', options: ['Orcas', 'Tiger sharks', 'Eagles', 'Humans'], correctIndex: 1, explanation: 'Tiger sharks and Galapagos sharks are the main natural predators of Hawaiian monk seals.' },
  { id: 95, category: 'monk-seals', difficulty: 3, question: 'When did the Caribbean monk seal go extinct?', options: ['1800s', '1952', '1980s', '2000s'], correctIndex: 1, explanation: 'The Caribbean monk seal was last seen in 1952 and officially declared extinct in 2008.' },
  { id: 96, category: 'monk-seals', difficulty: 1, question: 'How deep can monk seals dive?', options: ['10 meters', '50 meters', 'Over 500 meters', '5,000 meters'], correctIndex: 2, explanation: 'Hawaiian monk seals have been recorded diving to depths of over 500 meters to find food!' },
  { id: 97, category: 'monk-seals', difficulty: 2, question: 'Where do monk seals spend most of their time?', options: ['On land', 'In the water', 'In caves', 'On ice'], correctIndex: 1, explanation: 'Monk seals spend about two-thirds of their time in the water hunting for food.' },
  { id: 98, category: 'monk-seals', difficulty: 3, question: 'How are monk seals related to other seals?', options: ['They\'re the most ancient living seal lineage', 'They evolved recently', 'They\'re not true seals', 'They\'re related to sea lions'], correctIndex: 0, explanation: 'Monk seals are among the most ancient and primitive of all living seal species, dating back about 15 million years.' },
  { id: 99, category: 'monk-seals', difficulty: 1, question: 'What time of day are monk seals most active?', options: ['Morning only', 'Nighttime', 'They\'re active day and night', 'Only at sunset'], correctIndex: 2, explanation: 'Monk seals forage both day and night, though they often rest on beaches during the day.' },
  { id: 100, category: 'monk-seals', difficulty: 2, question: 'What is "monk seal toxoplasmosis"?', options: ['A type of fish', 'A disease from cat waste in the ocean', 'A skin condition', 'A mating ritual'], correctIndex: 1, explanation: 'Cat waste washed into the ocean can carry toxoplasma parasites that are deadly to monk seals.' },
];

function shuffleOptions(q: Question): Question {
  // Create index array [0,1,2,3] and shuffle it
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const shuffledOptions = indices.map(i => q.options[i]);
  const newCorrectIndex = indices.indexOf(q.correctIndex);
  return { ...q, options: shuffledOptions, correctIndex: newCorrectIndex };
}

export function getRandomQuestion(
  category: QuestionCategory | null,
  difficulty: Difficulty | null,
  excludeIds: number[]
): Question | null {
  let pool = questions.filter(q => !excludeIds.includes(q.id));
  if (category) pool = pool.filter(q => q.category === category);
  if (difficulty) pool = pool.filter(q => q.difficulty === difficulty);
  if (pool.length === 0) {
    // fallback: ignore difficulty filter first
    pool = questions.filter(q =>
      !excludeIds.includes(q.id) &&
      (!category || q.category === category)
    );
  }
  if (pool.length === 0) {
    // fallback: ignore excludeIds but keep half the pool excluded
    pool = questions.filter(q =>
      (!category || q.category === category) &&
      (!difficulty || q.difficulty === difficulty)
    );
  }
  if (pool.length === 0) return null;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return shuffleOptions(picked);
}
