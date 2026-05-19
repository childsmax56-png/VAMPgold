import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { saveAs } from 'file-saver';
import { useSettings } from './SettingsContext';
import { ID3Writer } from 'browser-id3-writer';

export const TAG_TOOLTIP_MAP: Record<string, string> = {
  'Best Of': 'some of the best leaks hosted on the tracker.',
  'Grails': 'the most wanted songs that have not yet leaked in full.',
  'Wanted': 'Songs that are wanted, but not as wanted as "Grails".',
  'Special': 'special songs that are not good enough to be in Best Of, but still deserves to be highlighted.',
  'Worst Of': 'some of the worst leaks hosted on the tracker.',
  'AI': 'Track contains AI vocals.',
};

export const CUSTOM_IMAGES: Record<string, string> = {
  "Before The College Dropout": "https://i.ibb.co/kpk9TzL/image-2026-05-04-074305465.png",
  "The College Dropout": "https://i.ibb.co/mrK8W4rL/image-2026-03-22-142639537.png",
  "Late Registration": "https://i.ibb.co/QvNMHS7f/image-2026-05-04-074325717.png",
  "Graduation": "https://i.ibb.co/gZmLyhpD/image-2026-05-04-074348808.png",
  "808s & Heartbreak": "https://i.ibb.co/gL1jHjxD/image-2026-05-04-074412180.png",
  "Good Ass Job": "https://i.ibb.co/zWDJvnF3/image-2026-05-04-074429956.png",
  "My Beautiful Dark Twisted Fantasy": "https://i.ibb.co/nMhS9cfq/image-2026-05-04-074450433.png",
  "Watch The Throne": "https://i.ibb.co/Gvh0rdt/ea89bace-a565-4fd7-aec2-de7f2a0341a2.jpg",
  "Thank God For Drugs": "https://i.ibb.co/G32JPb2w/image-2026-05-04-074528355.png",
  "Yeezus": "https://i.ibb.co/54tTPvy/YEEZUS-COVER-1-scaled.jpg",
  "Cruel Winter [V1]": "https://i.ibb.co/tPDQhJ3V/image-2026-05-04-074608802.png",
  "Yeezus 2": "https://i.ibb.co/gL2VPWGD/image-2026-05-04-074633664.png",
  "SWISH": "https://i.ibb.co/vvdd31rM/image-2026-05-04-074736182.png",
  "808s & Heartbreak: Live At The Hollywood Bowl": "https://i.ibb.co/gMW718Hb/i-made-the-808s-heartbreak-live-at-the-hollywood-bowl-on-v0-mz7y867oig3g1.webp",
  "ye": "https://i.ibb.co/4ffBbzd/0a170099-f725-41f6-88a9-c28ab2a6bdb8.jpg",
  "KIDS SEE GHOSTS": "https://i.ibb.co/xsRLz4k/28ef3e62-abba-4064-9dd7-44dd37803981.jpg",
  "KIDSSEEGHOSTS": "https://i.ibb.co/xsRLz4k/28ef3e62-abba-4064-9dd7-44dd37803981.jpg",
  "Good Ass Job (2018)": "https://i.ibb.co/Y4tB29pw/image-2026-05-04-075000044.png",
  "Yandhi [V1]": "https://api.pillows.su/api/get/45459f026801e8fbbbdf156e34d9daee",
  "Yandhi [V2]": "https://api.pillows.su/api/get/45459f026801e8fbbbdf156e34d9daee",
  "JESUS IS KING": "https://i.ibb.co/6cPT40L6/image-2026-05-04-075046079.png",
  "God's Country": "https://api.pillows.su/api/get/bf6a3725d457b7f79c3f8ada3e80b2cd",
  "JESUS IS KING: The Dr. Dre Version": "https://api.pillows.su/api/get/23ad5f0403e3cfa003973c1c6b863b55",
  "DONDA [V1]": "https://i.ibb.co/8rV5JJ3/children-park-manip-retouched.jpg",
  "Donda [V2]": "https://i.ibb.co/JjzVyMvT/image-2026-05-04-075158690.png",
  "Donda [V3]": "https://i.ibb.co/YX9xy2p/19e339a4-33e0-46ec-bd90-0e4ed62932cc.jpg",
  "Donda 2": "https://i.ibb.co/27D2fTXM/image-2026-05-04-075245507.png",
  "WAR": "https://i.ibb.co/93mVjHZV/WAR-youtube-thumbnail.png",
  "YEBU": "https://i.ibb.co/vxTD8nVh/image-2026-05-04-075337930.png",
  "Bad Bitch Playbook": "https://i.ibb.co/jknzBvyZ/image.png",
  "VULTURES 2": "https://i.ibb.co/35h4bhzG/image-2026-05-04-075431548.png",
  "VULTURES 3": "https://api.pillows.su/api/get/03c8ac234f1eb7ed59e87ef97c2f9ef5",
  "BULLY [V1]": "https://a5.mzstatic.com/us/r1000/0/Music221/v4/4b/38/d1/4b38d146-381d-ace2-73df-24074576e62b/656465138828_cover.jpg",
  "CUCK": "https://api.pillows.su/api/get/c24f4c5a0b2230ffb897cc358c15017c",
  "DONDA 2 (2025)": "https://i.ibb.co/b5ZNpDXk/cover.jpg",
  "Be": "https://i.ibb.co/RGmHbWZk/Common-Be.png",
  "IN A PERFECT WORLD": "https://i.ibb.co/Fqd2crvz/iapwcover.png",
  "BULLY [V2]": "https://a5.mzstatic.com/us/r1000/0/Music221/v4/4b/38/d1/4b38d146-381d-ace2-73df-24074576e62b/656465138828_cover.jpg",
  "The Life Of Pablo": "https://i.ibb.co/n8DkztcP/image-2026-03-22-142914834.png",
  "Turbo Grafx 16": "https://i.ibb.co/q3fggHMz/image-2026-03-22-143044324.png",
  "Turbo Grafix 16": "https://i.ibb.co/q3fggHMz/image-2026-03-22-143044324.png",
  "TurboGrafx 16": "https://i.ibb.co/q3fggHMz/image-2026-03-22-143044324.png",
  "TurboGrafix 16": "https://i.ibb.co/q3fggHMz/image-2026-03-22-143044324.png",
  "TurboGrafx16": "https://i.ibb.co/q3fggHMz/image-2026-03-22-143044324.png",
  "Wolves": "https://i.ibb.co/ydSS4sG/Wolves.png",
  "The Elementary School Dropout": "https://i.ibb.co/Z1RZYGWw/image-2026-03-22-143132521.png",
  "LOVE EVERYONE": "https://i.ibb.co/Tq7HkRKn/cell-Image-199908479-18.png",
  "Cruel Summer": "https://i.ibb.co/wr7sS6DH/cell-Image-199908479-8.png",
  "So Help Me God": "https://i.ibb.co/Lz3b2xDD/cell-Image-199908479-13.png",
  "VULTURES 1": "https://i.ibb.co/5hFN28jM/cell-Image-199908479-37.png",
  "Cruel Winter [V2]": "https://i.ibb.co/bjFdyLjv/image-2026-04-28-131805413.png",
  "Ongoing": "https://i.ibb.co/dwZ4cwmd/image-2026-04-27-185921217.png",
  "DAYTONA": "https://i.ibb.co/1fX0N137/Daytona.jpg",
  "NASIR": "https://a5.mzstatic.com/us/r1000/0/Music125/v4/f9/41/a9/f941a9d4-099d-4b65-484a-e585136ca838/18UMGIM37154.rgb.jpg",
  "K.T.S.E.": "https://i.ibb.co/rfZM2kCp/K-T-S-E.jpg",
  "NEVER STOP": "https://i.ibb.co/vC9c5qFM/never-stop.png",
  "Jesus Is Born": "https://api.pillows.su/api/get/61be2288632189d710fc6865f5efd9c7",
  "Sunday Service Choir": "https://i.ibb.co/nN2LDSxN/SSC.jpg",
  "Late Orchestration": "https://i.ibb.co/whrYVzkr/Late-Orchestration.jpg",
  "Child Rebel Soldier": "https://i.ibb.co/QFLpkFcz/IMG-3998.png",
  "BULLY": "https://a5.mzstatic.com/us/r1000/0/Music221/v4/4b/38/d1/4b38d146-381d-ace2-73df-24074576e62b/656465138828_cover.jpg",
  "Live": "https://i.ibb.co/zhhhyDVq/hq720.jpg",
  "Other": "https://i.ibb.co/G3VqQV3t/IMG-3890.jpg",
  "Aviation Class": "https://i.ibb.co/R8WT57M/IMG-0678.png",
  "Killing Me Softly": "https://i.ibb.co/8g2jJc1b/tumblr-lkbw3l-Lx-Ad1qfnd2oo1-540.jpg",
  "THC: The High Chronicals": "https://i.ibb.co/3Y04DsRv/6q1d-Uzi.png",
  "Kream": "https://i.ibb.co/G4JF7f7N/tumblr-m76a2c-Bm-D51qfnd2oo1-500.jpg",
  "Young Mi$fit": "https://i.ibb.co/kVFwht33/tumblr-mdcd9s2-I9-G1qfnd2oo1-500.jpg",
  "Sen$ation": "https://i.ibb.co/CK8KMmYp/a3383006450-16.jpg",
  "Awful Records": "https://i.ibb.co/VW5xv70J/artworks-000116608046-icqf3o-t1080x1080.jpg",
  "Chucky Era": "https://i.ibb.co/TMhhgR5n/artworks-000125767641-af7vmm-t1080x1080.jpg",
  "Ca$h Carti Season": "https://i.ibb.co/pT7t9hB/IMG-4079.png",
  "Playboi Carti": "https://i.ibb.co/qFMJNmfm/1200x1200-000000-80-0-0.jpg",
  "16*29": "https://i.ibb.co/3mqLxnN6/0x1900-000000-80-0-0-DIF-2.jpg",
  "16*29 [V1]": "https://i.ibb.co/3mqLxnN6/0x1900-000000-80-0-0-DIF-2.jpg",
  "Die Lit": "https://i.ibb.co/spcmgX6J/die-lit-playboi-carti-hi-res-cover-133548411.jpg",
  "Whole Lotta Red [V1]": "https://i.ibb.co/6RQMsWx9/WHOLE-LOT-OF-RED.jpg",
  "WE DON'T DIAL 911": "https://i.ibb.co/ksjjq3vj/IMG-0674.jpg",
  "Whole Lotta Red [V2]": "https://i.ibb.co/Qjb9bD1V/IMG-0675.jpg",
  "Whole Lotta Red [V3]": "https://i.ibb.co/0pLvdrrd/IMG-0676.png",
  "Whole Lotta Red (Deluxe)": "https://i.imgur.com/U2x2OPH.png",
  "Whole Lotta Red [V4]": "https://i.ibb.co/BWs9m6z/IMG-0677.jpg",
  "Narcissist": "https://i.ibb.co/HL4LmCsJ/IMG-4068.png",
  "MUSIC [V1]": "https://i.ibb.co/PZDxHz50/484456766-1062141895957335-7903129463974570707-n.jpg",
  "MUSIC [V2]": "https://i.ibb.co/G3kGpbdB/6ac65b919ce5339d3f2707c03b8909ec-1000x1000x1.jpg",
  "MUSIC [V3]": "https://i.ibb.co/4Z3BndNL/1200x1200.jpg",
  "THC: The High Chronical$": "https://i.ibb.co/3Y04DsRv/6q1d-Uzi.png",
  "The High Chronical$": "https://i.ibb.co/3Y04DsRv/6q1d-Uzi.png",
  "death in tune": "https://i.ibb.co/VW5xv70J/artworks-000116608046-icqf3o-t1080x1080.jpg",
  "Cash Carti The Mixtape": "https://i.ibb.co/spDSTTBd/IMG-4071.jpg",
  "Digital Nas Collab": "https://i.ibb.co/cXJ34C8c/IMG-4072.jpg",
  "No Pressure": "https://i.ibb.co/4ngn6sz0/IMG-4076.png",
  "TrapMoneyBenny Collab": "https://i.ibb.co/Pzrdqnhz/IMG-4075.png",
  "Donda": "https://i.ibb.co/S4HZS9hp/Kanye-West-Donda-With-Child.png",
  "Ye - DONDA": "https://i.ibb.co/S4HZS9hp/Kanye-West-Donda-With-Child.png",
  "VULTURES": "https://i.ibb.co/b5CxHHPw/VULTURES-1.jpg",
  "CARTI YE": "https://i.ibb.co/VYzzYWNK/484831956-18026675570648887-6286441502178479497-n.jpg",
  "004KT": "https://i.ibb.co/6cQGqrqN/IMG-4074.jpg",
  "BABY BOI": "https://i.ibb.co/5WmWFQcJ/IMG-4073.jpg"
};

export const ALBUM_RELEASE_DATES: Record<string, string> = {
  "Before The College Dropout": "??/??/????",
  "The College Dropout": "02/10/2004",
  "Late Registration": "08/30/2005",
  "Graduation": "09/11/2007",
  "808s & Heartbreak": "11/24/2008",
  "Good Ass Job": "??/??/2009",
  "My Beautiful Dark Twisted Fantasy": "11/22/2010",
  "Watch The Throne": "08/08/2011",
  "Cruel Summer": "09/14/2012",
  "Thank God For Drugs": "??/??/2012",
  "Yeezus": "06/18/2013",
  "Cruel Winter [V1]": "??/??/2013",
  "Yeezus 2": "??/??/2014",
  "So Help Me God": "??/??/????",
  "SWISH": "??/??/2015",
  "The Life Of Pablo": "02/14/2016",
  "Cruel Winter [V2]": "??/??/????",
  "Wolves": "??/??/2016",
  "Turbo Grafx 16": "??/??/2016",
  "LOVE EVERYONE": "??/??/2018",
  "DAYTONA": "05/25/2018",
  "ye": "06/01/2018",
  "KIDS SEE GHOSTS": "06/08/2018",
  "NASIR": "06/15/2018",
  "K.T.S.E.": "06/23/2018",
  "Good Ass Job (2018)": "??/??/2018",
  "Yandhi [V1]": "??/??/2018",
  "Yandhi [V2]": "??/??/????",
  "JESUS IS KING": "10/25/2019",
  "Jesus Is Born": "12/25/2019",
  "God's Country": "??/??/????",
  "JESUS IS KING: The Dr. Dre Version": "??/??/????",
  "DONDA [V1]": "07/18/2020",
  "Donda [V2]": "??/??/????",
  "Donda [V3]": "08/29/2021",
  "Donda 2": "??/??/????",
  "WAR": "04/01/2022",
  "YEBU": "??/??/????",
  "Bad Bitch Playbook": "??/??/2023",
  "VULTURES 1": "02/10/2024",
  "VULTURES 2": "08/03/2024",
  "The Elementary School Dropout": "03/10/2024",
  "VULTURES 3": "??/??/????",
  "BULLY [V2]": "03/28/2026",
  "BULLY [V1]": "03/18/2025",
  "CUCK": "03/06/2025",
  "DONDA 2 (2025)": "04/29/2025",
  "NEVER STOP": "06/27/2025",
  "IN A PERFECT WORLD": "06/22/2025"
};

export const HIDDEN_ALBUMS: string[] = [
  "CARTI YE",
  "Ye - DONDA",
  "VULTURES",
];

export const ALBUM_DESCRIPTIONS: Record<string, string> = {
  "DAYTONA": "DAYTONA is the third studio album by American rapper Pusha T. It was released on May 25, 2018, by G.O.O.D. Music and Def Jam Recordings. DAYTONA was announced by Kanye West via Twitter on April 19, 2018, alongside the album's release date. It was one of the Wyoming projects worked on during 2018 by Kanye.",
  "K.T.S.E.": "In an interview with Hot 97 in March of 2018, Taylor revealed that she had been working on music with Kanye in Wyoming, referring to him as \"Polo 'Ye\" - alluding to him returning to his old \"Polo-shirt roots\" (i.e. TCD-era production). The album was eventually put on the tail end of the Wyoming releases, releasing June 22nd, 2018. Kanye was notably still finishing the album on the plane ride to the albums LP, as confirmed in a Tweet from Kim Kardashian.",
  "NEVER STOP": "NEVER STOP is a collaborative album by American rappers King Combs and Ye. King Combs is the son of rapper Diddy. It was released on June 27, 2025, though Goodfellas Entertainment. It follows Combs' second extended play, C3. The album is the first collaborative project from Combs and the sixth collaborative effort from Ye. Combs and West served as executive producers on the album alongside lead artists, and West's daughter North, Jaas, and the Hooligans served as features.",
  "NASIR": "After the 2012 release of Life Is Good, Nas announced in January 2013 that he was working on a new album. Time would pass with little-word on the project, until the 2014 remix to ScHoolboy Q's \"Studio\", where Nas rapped that he, \"finished up [his] new album\" - however, no album ever materialized. In March 2016, Kanye Tweeted that he \"promised Obama Ima do beats on NAS' next album\". As if it was fate, on April 23rd, 2018, Kanye announced that he was executive producing Nas' next album. The album followed its expected release date, dropping June 15th, 2018.",
  "The Elementary School Dropout": "",
  "Before The College Dropout": "Before Kanye released his first album to critical acclaim in 2004, he pursued many other projects, including a rap trio group named the \"Go Getters\" and production for other rappers, including, but not limited to JAY-Z, Common, Talib Kweli, and Scarface. Two years before the release of The College Dropout, Kanye began releasing a series of mixtapes to generate hype and publicity for the eventual release of his first album. Kanye eventually signed with Roc-A-Fella records in August 2002.",
  "Be": "Sometime in 2004, Kanye started officially working on music with fellow Chicago MC, Common. Soon, the following year, Kanye would executive produce his 6th studio album, Be. Considered to be his comeback album after the commercial disaster of his previous release, Electric Circus, it was released under the G.O.O.D. Music label and received much critical acclaim, with many considering it to be Common's \"Magnum Opus\".",
  "The College Dropout": "Following his signing to Roc-A-Fella Records, Kanye released his debut studio album, The College Dropout. It features string arrangements, choirs, and his signature soul sampling, frequently branded as \"chipmunk soul\" for its sped-up and high-pitched nature. Contrary to the popular gangster-persona lyrics at the time, his songs mostly revolved around themes of family, materialism, religion, and racism. The inspiration for finally making his music came when he was in a near-fatal car crash.",
  "Late Registration": "Late Registration continues the social themes introduced in The College Dropout, but now with orchestral production influenced by co-producer Jon Brion. Kanye's newfound success allowed him to expand his ambitions from a single violinist to an entire string orchestra, mixing it with production including chipmunk soul and lullaby-like instrumentals. Lyrically, the album features a mix of more socially charged songs to more personal cuts. Production-wise, inspiration came from artists such as British trip-hop band Portishead and Fiona Apple's second album When The Pawn…",
  "Graduation": "Graduation is the third studio album from Kanye West. Inspiration came from stadium tours, indie rock, and house music. It was a considerable departure from the sound Kanye had used on his first two studio albums, which featured samples and inspirations from the soul and orchestral music Kanye grew up alongside. This album included a much more electronic sound, featuring layering synthesizers. Lyrically, Kanye analyzes himself and talks about his life after becoming famous and how the media criticize him.",
  "808s & Heartbreak": "Following the death of his mother due to complications after cosmetic surgery, his relationship with fiancé Alexis Phifer finally ending for good, and a struggle to adapt to his celebrity status, Kanye felt emotionally drained and lost. Kanye dealt with his pain by channeling it into a sonically stripped-down album, one dominated by his use of the titular Roland TR-808 drum machine and Auto-Tune. This album significantly influenced future hip-hop music, having influenced Drake, Future, Travis Scott, and more.",
  "Good Ass Job": "As far back as 2003, Kanye had planned a four-album series revolving around going to college, with Good Ass Job concluding the series. The death of his mother derailed this plan, with his fourth album becoming the somber 808s & Heartbreak. People still expected Good Ass Job to release, though, as Kanye's next album as late as early 2010. When the wake of the 2009 VMAs incident happened, it would cause Good Ass Job not to release. The title seems to have changed to MBDTF around May 2010 or atleast not called GAJ anymore. The cover included for this era is the original cover for the single \"POWER.\"",
  "My Beautiful Dark Twisted Fantasy": "Conceived during West's self-imposed exile following the 2009 VMA incident and further influenced by his deteriorating relationship with model Amber Rose, My Beautiful Dark Twisted Fantasy is a genre-bending masterpiece that explores the darker sides of celebrity, fame, and love. With grand production that sounds like the natural evolution of all the albums that came before it, this is seen by many as Kanye's best album, even earning an extremely rare 10/10 rating from Pitchfork.",
  "Watch The Throne": "Considered one of the most legendary collab albums of all time, Watch The Throne puts together two of the most legendary figures in music history for a full studio album. Kanye teams up with his big brother, JAY-Z, for an album, focused primarily on luxury, black excellence, and the American dream. The album's production also reflects that, and having been recorded by two future billionaires primarily in New York City's Tribeca Grand Hotel, how could it not?",
  "Cruel Summer": "A compilation of new songs from Kanye's label, G.O.O.D. Music, 2012's Cruel Summer is one of the most collaborative Kanye projects he accomplished. Featuring various collaborations with Pusha T, Big Sean, 2 Chainz, John Legend, and many more, this album spawned many big hits, including \"Mercy\" and the remix of the Chief Keef song \"Don't Like.\" This album also marks the first time Kanye would work with Travis Scott, an at-the-time complete unknown with no mixtape to his name.",
  "Thank God For Drugs": "Before Kanye chose the name Yeezus for his sixth solo album, the name was Thank God For Drugs. Recording started in 2012 and accelerated in early 2013, with Kanye and his producers producing material very quickly. The tracklist for the album boasted 20 songs, with around 3.5 hours of rough material created for the album. After changing the album's name to Yeezus, Kanye recruited Rick Rubin to cut down this material and take the music in a minimal direction.",
  "Yeezus": "Yeezus marked a complete reverse from the bombastic production that Kanye accomplished on My Beautiful Dark Twisted Fantasy. He swapped lush soul and anthemic hooks for splintering electro, acid house, and industrial force while packaging some of his most lewd and heart-crushing tales. Initially envisioned as Thank God For Drugs, a much larger project, Kanye would play the album for Rick Rubin, he later recalled listening to roughly 3-hours of unfinished material that seemed to need months worth of work - despite the release date being a month away. Kanye enlisted Rubin to refine and complete the project, finishing a majority of the songs just two days before release.",
  "Cruel Winter [V1]": "The 2013 version of Cruel Winter, the first version of the sequel to 2012's Cruel Summer, is a mystery. No single for this album was released, and most of the info comes from leakers and insiders. It had many songs with A Tribe Called Quest member Q-Tip, who was notably absent from Cruel Summer despite having already been signed to the label. There is no official cover for this album, so we're using a fanmade cover to represent this era.",
  "Yeezus 2": "After Rick Rubin and Kanye West cut down Yeezus to the final ten tracks, Kanye still saw potential in much of the cut material. Thus, shortly after Yeezus was released, an EP of leftovers titled Lost Yeezus was already being teased. The project then evolved into a full-fledged album of mostly new material, with Yeezus 2 acting as a codename before they could choose the last name. This project would develop into So Help Me God as the songs evolved.",
  "So Help Me God": "Announced in February 2015, So Help Me God is now one of Kanye's most infamous unreleased projects. Essentially being a more advanced version of the songs developed during the Yeezus 2 era, So Help Me God gained significant hype as the teaser tracks of \"Wolves,\" \"All Day,\" and \"Only One\" was revealed to the public. Despite intending to release the album in March 2015, Kanye never finished So Help Me God, and only a few songs from the era ended up on The Life Of Pablo.",
  "SWISH": "After changing the name of his 7th solo album from So Help Me God to SWISH, Kanye began to develop all new songs throughout mid-late 2015 meant for the album, with most of them eventually making it onto the final release of The Life Of Pablo. Kanye also continued to work on many So Help Me God and Yeezus 2 tracks, but by the end of 2015 and the start of 2016, Kanye had dropped most of these tracks from the tracklist for SWISH, which began to resemble the final TLOP tracklist strongly.",
  "The Life Of Pablo": "The Life Of Pablo is Kanye's 7th studio album, with constant name changes before release. Sporadic and scatter-shot, the album is one of a kind. The title refers to three people: artist Pablo Picasso, drug dealer Pablo Escobar, and Paul the Apostle, whose name is Pablo in Spanish. The album was initially released only on TIDAL, but later made its way to other streaming services with some updates. Kanye finally finished it by adding the track \"Saint Pablo.\"",
  "Cruel Winter [V2]": "After the 2013 rendition of Cruel Winter ended production, Kanye revived it in 2016. With only one official single released, this album took many ideas from popular music at the time, including many trap elements, remixes, and the biggest music stars. The label supposedly worked on it as late as November 2017, but the album has yet to come. There isn't an official cover for this album we know of, so we are using the single art for \"Champions.\"",
  "Wolves": "Wolves was meant to be a collabaration album between Kanye West & Drake. The project was first mentioned by Ye in an interview in 2015, and billboards would be spotted with the phrase \"Calabasas Is The New Abu Dhabi\" with the OVO and G.O.O.D. Music logos in mid-2016 which hinted the album was coming soon. Drake later even stated the album was finished and up to Kanye to release, but despite this multiple insiders have stated that Wolves was mainly just a session and nothing much came out of it. The cover used for this era is a recreation of the image used on the billboards.",
  "Turbo Grafx 16": "Immediately after Kanye released The Life of Pablo, he announced a whole new album titled Turbo Grafx 16, intended to be released in the summer of 2016. Kanye intended to pursue a futuristic sound, wanting to incorporate video game samples into the record. However, work on the album was short-lived, as Kanye began touring in August 2016 and scrapped the concept entirely after being diagnosed as bipolar. The cover included for this era is unofficial, despite being popular among Kanye fans.",
  "LOVE EVERYONE": "After Kanye was released from UCLA Medical Hospital and diagnosed as bipolar, he bought a ranch in Wyoming where he would produce his next album and multiple albums for his collaborators. The concept of the album came together in 2018. The album's subject matter varied wildly, with some songs being about introspection and change and others discussing his political views. The public name given for this album is LOVE EVERYONE, but it is known that Kanye likely considered the Hitler title longer.",
  "ye": "ye discusses topics in Kanye's life, including mental health, family, and addiction. He also explicitly announced his diagnosis of bipolar disorder through the album's artwork and a proclamation within the album. The seven-song project, created in Jackson Hole, Wyoming, was released alongside five other projects. Kanye revealed in an interview that after his infamous TMZ interview (in which he stated that slavery was a choice), he completely re-did his album with an entirely new theme.",
  "KIDS SEE GHOSTS": "Out of the five Wyoming projects from 2018, people consider KIDS SEE GHOSTS one of the best. This album focuses heavily on overcoming struggles caused by mental health, which Kanye and Cudi have been fighting. It's characterized by many psychedelic and rock-influenced elements, making for an album that sounds like nothing else. This album was officially released on June 8th, 2018, making it Kanye's second collab album.",
  "Good Ass Job (2018)": "Kanye and Chance collab project that people talked about for years before being officially announced in 2018. The project was supposed to be just seven tracks long, similar to all the Wyoming albums. The central theme of this project is a celebration, as many of the tracks we've heard from this project seem to be very joyful and uplifting. Kanye and Chance presumably canceled it sometime in 2019. This project has no covers we know of, so we have used unofficial artwork.",
  "Yandhi [V1]": "Upon hearing the beat to \"Hurricane\" during sessions for Good Ass Job (2018), Kanye became inspired to create a whole new album titled Yandhi. With the album's concept in his mind, Kanye and his producers began frenzied work as they developed multiple new songs throughout September 2018, aiming for a September 29 release date. As they did not meet this deadline, Kanye went to Uganda to conduct further work on the album, but delayed it indefinitely on November 13.",
  "Yandhi [V2]": "After Kanye delayed Yandhi indefinitely, he began working with record producer Timbaland to create \"more healing music\" for the album. Shortly after the announcement of the delay, Kanye underwent a sudden and dramatic conversion towards born-again evangelical Christianity, debuting the Sunday Service Choir at the start of 2019. The creation of the choir coincided with the songs on Yandhi taking a new Christian lyrical focus. Eventually, the album would morph into the thoroughly Christian JESUS IS KING by mid-2019.",
  "JESUS IS KING": "Following a revelation on Easter 2019 at Coachella, Kanye scrapped Yandhi and reworked it to focus on God and Christianity. This album ended up being JESUS IS KING. After a private listening party in Detroit, Kim Kardashian announced that the album would release on Sunday, September 29, following listening parties in Chicago and New York. It didn't, and there were no updates for almost a month. On October 20, 2019, Kanye suddenly reappeared on Twitter to announce the final release date.",
  "Jesus Is Born": "First announced on Kanye's interview with Zane Lowe on Apple's Beats 1 Radio station, Jesus Is Born is the first - and only - album from the Sunday Service Choir (also referred to as Sunday Service), a gospel choir founded and led by Kanye West. It would release on Christmas Day 2019, peaking at #2 on the Billboard U.S. Gospel charts, and #73 on the Billboard 200 charts. The album does not have a single original song, as all are interpolations of other artists' songs - or interpolations of Kanye West originals.",
  "Sunday Service Choir": "This Tab features all other Sunday Service Choir songs/performances that span across these eras: Yandhi / JESUS IS KING / God's Country / DONDA",
  "God's Country": "Shortly after the release of JESUS IS KING, Kanye (almost immediately) started working on new material. Songs from this era revolve around his faith while also consisting of dark themes (such as prison) and lyrics about current social issues. Initially announced as God's Country on May 20th, 2020 by Arthur Jafa, tracks from this album would go on to be developed further in the DONDA [V1] era, following Kanye getting new inspiration to make an album dedicated to his mother.",
  "JESUS IS KING: The Dr. Dre Version": "The release of JESUS IS KING was met with mixed reviews from fans and critics. Kanye then took to Twitter to announce that he was working on a new album with Dr. Dre. Initially conceived as a remix album, it eventually grew to incorporate mainly unreleased material. During the #WESTDAYEVER campaign, Kanye did on Twitter in 2020, it was supposed to release officially, but never did. It ended up being scrapped sometime in 2020, as stated by producer Dem Jointz. Kanye posted the cover in 2022, which is assumed to be for the album.",
  "DONDA [V1]": "With new inspiration to work on an album dedicated to his mother, Kanye continued working on previous demos and new ideas. The music of this era reflects Donda's impact on Kanye in a colorful sound while reflecting his mania and the stress he was going through focusing on his businesses while also running for President. With multiple failed release dates for the album, Kanye went into silence in early 2021, finishing up tracks until the album morphed into something very different.",
  "Donda [V2]": "After taking a break from music in early 2021, Kanye went to work at the Pio Pico studio in LA with an entirely new vision for the album. While the name remained the same, the sound shifted to be more experimental and less soulful. Working with producers such as E.VAX, Dem Jointz, and Digital Nas, Kanye went through hundreds of beats, laying down vocals and trying to come up with ideas for songs. This era would continue until Kanye decided to finalize the album, shifting to the more minimalistic release sound.",
  "Donda [V3]": "Almost a year after the initial announcement of Donda, a Beats by Dre ad revealed that a listening party would take place at the Mercedes-Benz Stadium in Atlanta. It happened, but the album didn't drop. Kanye moved into the stadium and lived there until the second listening event two weeks later. Once again, the album did not release. Ye later announced a third listening party at Soldier Field in Chicago, with the album coming the next day. It didn't. The album ended up releasing on August 29th, 2021 at 8AM EST, almost two days after the final listening party.",
  "Donda 2": "Donda 2 was announced by Ye via Instagram, being executive produced by Future. Ye then proceeded to get into many significant controversies. He hosted a listening party for it in Miami, in which many of the tracks were unfinished. It was released on the Stem Player a few days later, but it was still incomplete. Months later, Ye got into even more controversies, making him get dropped by Adidas, buy the social media Parler, and lose his billionaire status following his proclaiming \"White Lives Matter\" at Yeezy Season 9.",
  "WAR": "A collaborative project between Ye and James Blake. Sessions for the project began around April 2022. On his third Drink Champs interview, Ye referred to these sessions as work for \"their album\". Three songs from the project were played at a party featured on Naomi Campbell's Instagram, with the song \"What I Would Have Said At Virgil's Funeral\" being previewed in full at YZY Season 9 shortly thereafter. The project was presumably scrapped in the wake of Ye's numerous antisemitic comments.",
  "YEBU": "Days before Ye was set to hold YZY Season 9, he suddenly changed plans for the event and wore a \"White Lives Matter\" shirt. After that, Ye tweeted about going \"death con 3\" on Jewish people. Following an interview with Alex Jones in which he proclaimed himself a Nazi and claimed he \"liked Hitler,\" many fans and artists gave up supporting Ye and his antics. Following this and an \"apology\" posted on Instagram, Ye went silent for months and began working on new material in Italy with his frequent collaborators. Reportedly being made at the same time as VULTURES. The cover for this era is from the \"Someday We'll All Be Free\" single.",
  "Bad Bitch Playbook": "Ye and Ty Dolla $ign frequently collaborated during the sessions for YEBU, hinting at a joint project. A snippet featuring Ty was released on October 2nd, 2023, leading to the song \"BACK TO ME\", and confirming a joint album via Instagram. TMZ later reported that Ye was producing both a solo album and a collaborative one with Ty. Then, during the Saudi Arabia recording sessions for Bad Bitch Playbook Vol. 1 in November 2023, the name for the collaborative project between Ty Dolla $ign & Ye would be changed to Vultures, with that coming a sonic change in the project.",
  "VULTURES 1": "After the album's name change from Bad Bitch Playbook Vol. 1 to VULTURES 1, four listening parties were scheduled between December 12th, 2023, and February 9h, 2024. In 2024, Ye announced that VULTURES would be a trilogy, with the first installment dropping on February 9th, followed by the second and third albums in March and April. VULTURES 1 would end up being released on February 10tth, the day after the final listening party.",
  "VULTURES 2": "VULTURES 2 was announced alongside 2 other volumes of VULTURES, and was meant to release on March 8th, 2024, and then May 3rd, 2024. This album would've became the first release exclusive to the YZYAPP. The cover shows Ty Dolla $ign holding a portrait of his brother Big TC, who is currently in prison. After the album failed to drop on May 3rd, 2024, the direction of the project completely shifted, and was to be censored. The album failed to drop August 2nd and then dropped August 3rd with questionable mixing/songs.",
  "VULTURES 3": "Was announced alongside the 2 other volumes and was set to release on April 5th, 2024, however this didn't happen. The project was thought to have been scrapped after the rushed release of VULTURES 2, and Ye's apparent focus on his solo project BULLY. However, Ty stating that \"V3 boutta rip heads off\" in 88-Keys' Instagram Live chat, and Ye heart reacting a fan's message asking if the project still exists, seem to contridict this. The project was set to drop in 2025, however given Ye's recent statements against Ty Dolla $ign, and his signal on twitter that he was working to remove Ty from Melrose, it's assumed that the project is now scrapped. When asked if the album is coming, Ty Dolla $ign responded with \"Six Seven.\"",
  "BULLY [V1]": "On September 3rd, 2024, the CEO of Channel Candy, Ye's new touring company, confirmed that work on a new solo Ye album had began after the South Korea Vultures listening experience. On September 28th, 2024, on the second Haikou listening event, Ye confirmed that the album name is Bully, which references the movie with the same name that he posted on his Instagram story a few days prior to the event. On January 2nd, 2025, Ye announced the album would have AI on it after months of speculation, and that it could help AI become used more in music. After the release of Bully V1, Ye confirms his intention to re-record the AI on Bully, and stated it was being mixed.",
  "CUCK": "On March 6th, 2025, Ye tweeted, \"this next album got that antisemitic sound\" and \"my new sound called antisemitic\". This would mark a shift in Ye's soundscape, as his antisemitic ideas had been mostly contained to his Twitter at that time, besides a few one-off remarks about Jews on the VULTURES albums. On March 16th, 2025, Ye would tweet an image of a red swastika against a black background, declaring it as a \"NEW ALBUM COVER\". On April 2nd. 2025, DJ Akademiks would post a series of Tweets that eventually led to the announcement of a new album titled WW3, separating this project from BULLY.",
  "DONDA 2 (2025)": "After releasing Donda 2 via the Stem Player in 2022, Ye would eventually move onto other projects. However, the project never left his mind, with some songs continuing to be considered in the Vultures era. 2025 would see Ye enter a new era of creative fuel, once again working on multiple projects at once. With plans to release BULLY and CUCK, Ye also spoke of plans to \"officially\" release Donda 2, repeatedly saying he planned to rerecord verses and upload a \"finished\" version of the album.",
  "IN A PERFECT WORLD": "After taking to Twitter in May 2025 to \"denounce\" his antisemitism, Ye would go return to being mostly absent from social media/public eye. Around this same time, he and Bianca would admit themselves into a wellness retreat, with Bianca posting a snippet to her Instagram of Ye in his DROAM-ified home, backed by a new song that suggested a possible return/shift to religious themes once again. In late-June, Ye would announce another album name change to \"In A Perfect World\".",
  "BULLY [V2]": "After leaking the BULLY V1 visual albums on Twitter, Ye would promise to record over all the album's AI vocals. Throughout 2025, Ye would continue working on the album while teasing numerous release dates that would come and go. On June 20th, 2025, three singles would drop for the album, alongside two more dropping the following week; only one of these songs did not contain AI, being the previously unheard \"DAMN\". Later in 2025 into early 2026, YEEZY and its associates would repeatedly claim the album was now fully recorded, and that no AI would be used on its release. The album would finally drop on March 28th, 2026 with YEEZY only being partially truthful as some songs still contained AI, most prominent on the second half of the album.",
  "Ongoing": "",
  "Aviation Class": "Carti would first starting working on music around 2009, with his first musical appearance being the \"Jordan acting stupid\" video, At the time, he was going by the name \"JCee\" (Abbreviation of Jordan and Carter, very creative Carti !), he revealed in an interview that his childhood nickname is \"Moot\". An old classmate of his revealed that he used to be at the after-class activities to make music in the school studio where the \"Jordan acting stupid\" video was filmed. He would first announce a mixtape called \"Aviation class\" on Sep 19, 2010, but didn't release anything, except a couple of singles 5 months later. On Apr 10, 2011 he would end up changing his name to $ir Cartier, and on Apr 27, 2011 he would announce a new mixtape called Killing Me Softly, which would not drop as well.",
  "Killing Me Softly": "A project first teased by Carti on April 27, 2011. Later carti left the project without mention until THC's release. The album uses the same image as it's cover as Nas's NASIR, even though the album was concieved 6 years before NASIR.",
  "The High Chronical$": "Second mixtape carti has ever released after Aviation Class. After teaing the mixtape in april as Killing Me Softly, he finally released the album on Nov 5, 2011 on DatPiff, Limelinx and MixtapeFactory, which on both the album is currently unaccessable likely being lost forever.",
  "Kream": "Project promoted by Carti in Mid-2012, only one single was released for the project ($teeze). The project later morphed into Young Mi$fit.",
  "Young Mi$fit": "A mixtape made in 2012, released on Nov 11, 2012. The mixtape was (probably) first called Kream, as the filename for OG version of Steeze suggests, but later it was retitled and probably reworked to the Young Mi$fit mixtape. The mixtape is fully availbable and OG files for the whole project leaked on Apr 27, 2021",
  "Sen$ation": "A mixtape made in 2013, probably scrapped, but it might've been released.",
  "death in tune": "In 2014, Playboi Carti signed to Awful Records and started gaining a lot of popularity and momentum. During this era Carti used a red cover for his SoundCloud singles, hence Red Tape also being a popular name for this period of Carti's career. The era ended with the release of death in tune EP, after which he changed his style and started working more with MexikoDro and generally different people than he worked with during the Awful Records Era.",
  "Cash Carti The Mixtape": "After the release of death in tune, Playboi Carti's style shifted. He started collaborating more with MexikoDro, and going deeper into the Plugg sound. The era get's the name from the Chucky inspired covers for Carti's soundcloud singles during this era. The era ended on January 2, 2016 because Carti failed to release project & changed his sound and aesthetic again.",
  "Ca$h Carti Season": "Carti changed his style in early 2016 after meeting many famous rappers. This was his third era, which he referred to as Ca$h Carti, and it was the largest embodiment of this era. Carti was at the peak of his flexing game and his career was moving at its fastest pace. This era concluded with him signing to AWGE and reworking the mixtape once again, which later released in 2017.",
  "Digital Nas Collab": "Alongside work on Carti's third mixtape, Digital Nas and Carti worked on a collaboration project together. Digital Nas mentioned the project on Instagram, but the album never materialized aside from the song \"Run It\" being released by Digital Nas on soundcloud in 2015. The album as a whole was likely quietly scrapped some time in 2017. The cover for this era is from the soundcloud release of \"Run It.\"",
  "Playboi Carti": "After his signing to AWGE and Interscope records, Carti's next mixtape began to change focus, and the mixtape created with Awful Records was transformed. Playboi Carti is the self-titled third mixtape from Playboi Carti, executively produced by A$AP Rocky, with heavy production from Pi'erre Bourne. The album would heavily focus on repetitive earworm performances over Pi'erre's signature psychedelic trap beats. It was supported by three singles, \"Lookin\", \"wokeuplikethis*\", and \"Magnolia\", the latter of which was awarded Best New Track from Pitchfork.",
  "No Pressure": "On Oct 31, 2017 a fan asked Rich The Kid on his reddit AMA if he has any unreleased Collaborations with Playboi Carti, to which Rich The Kid responded \"WE HAVE A WHOLE UNRELEASED MIXTAPE TOGETHER\". Project eventually got scrapped due to unknown reasons and most of songs from the tape where given to either Rich The Kid or feature artists.",
  "16*29": "In September of 2017, Playboi Carti announced via Snapchat and Twitter that he would be collaborating with Lil Uzi Vert on a joint album titled 1629*. The following month, a tour for the album was announced by the two, but it was shortly canceled afterward when Uzi said he would not be going on tour with Carti because he \"needed to focus.\" The album would fall by the wayside until July of 2018, when Carti mentioned that he and Uzi had recorded \"like 100 songs.\" After that, all talk of the album pretty much subsided. It should be noted that many insiders have claimed that there was never a tracklist, cover art, or marketing plan put together.",
  "Die Lit": "Die Lit is Playboi Carti's debut studio album and a follow-up to his eponymous debut mixtape. The album is executively produced by Pi'erre Bourne and boasts features from Young Thug, Lil Uzi Vert, Travis Scott, Nicki Minaj, and Skepta, among many others. Die Lit is a reminder of the power of simplicity, as the album is full of effortless vibes and hypnotic flows that create an array of catchy, uncomplicated tracks. Carti explores different vocal inflections, and he emphasizes his Atlanta accent in his delivery. Before the album's release, fifteen songs recorded during production of the album were leaked online. However, only four of the leaked tracks were actually on the album; these are \"Shoota\" (the leaked version was a rough demo), \"Love Hurts,\" \"Choppa Won't Miss,\" and \"Foreign.\" On May 2, 2018, Carti officially released \"Love Hurts\" on SoundCloud as the album's lead single.",
  "Whole Lotta Red [V1]": "The first iteration of Whole Lotta Red aimed for a very similar sound to Die Lit, with Carti rapping over cloudy trap beats, and producer Pi'erre Bourne reprising his role as the premier beatmaker for the album with one difference: his now-famous \"Baby Voice,\" prominent on songs like \"Pissy Pamper\" and \"Goku.\" Around a month after the release of Die Lit, Carti previewed \"Buffy The Body\" on a private account Instagram Live and announced he was working on Die Lit 2. In August of 2018, a video surfaced of Carti discussing the album, now referring to it as Whole Lotta Red.",
  "WE DON'T DIAL 911": "Trippie Redd answered to a comment from a fan asking him for an EP with Carti \"sooner than later\", alongside posting potetional cover art for the project on his burner IG. The EP was actually likely worked on during 2019, due to Carti and Trippie having a lot of songs from this time. The album was later scrapped and the songs were either vaulted or given to smaller artists.",
  "Whole Lotta Red [V2]": "The second iteration of Whole Lotta Red represents Carti's peak of experimentation, pushing his \"baby voice\" and high-pitched vocals to new extremes. He collaborated with Pi'erre Bourne, Richie Souf, and Maaly Raw, floating over a mix of heavenly synth beats and hard trap, but after mixed reactions to the V2 sound upon the release of \"@ MEH\" (everbody thought it was fucking shit), Carti scrapped and reworked the project before its final release. The cover art from this era comes from the @ MEH single, marking a transitional phase. Carti also underwent a major aesthetic transformation, dyeing his hair blonde, switching from freeform dreads to re-twists, and embracing avant-garde fashion, especially Rick Owens. The upside-down cross became central to his imagery, linking him to his Opium collective. Though initially divisive, the V2 sound is now regarded as a fan-favorite, with many tracks considered grails, marking this as one of his most experimental and influential phases.",
  "Whole Lotta Red [V3]": "After the death of his friend Bigg Sosa, Carti takes more time to release the album and abandons social media until October, where he finally made his return to announce the rollout of his awaited second studio album Whole Lotta Red. We know that Carti isn't a really good lyricist, but on certain tracks, he talks about the grief he experienced when Bigg Sosa passed and expresses how he copes on songs like 'ILoveUIHateU,' where he opens up about his drug addiction. Songs during this era have more of a somber, relaxed tone compared to the rest of his works, abandoning his baby-voice for an early version of what we know as his raspy voice. This shift was partly driven by the immense hate and criticism he received for the baby-voice, pushing him to explore a darker and more aggressive vocal style. Leakers say that there was a September version of Whole Lotta Red with a finalized tracklist, but we will probably never hear what this version of the album sounded like.",
  "Whole Lotta Red [V4]": "In late 2020, Carti would shift the sound of Whole Lotta Red into being an aggressive ode to punk rock aesthetics, while maintaining the repetitive vocal style that made his previous work so loved. The album was his biggest musical departure by far, forgoing most of the things that brought him success in the first place, such as production from Pi'erre Bourne, or features from popular collaborators like Lil Uzi Vert or A$AP Rocky. Instead, the album would only see a handful of features, and would see production predominantly from F1LTHY & Art Dealer. Connecting to V3, on this album Carti talks about his acts violence, expressing how he felt when Bigg Sosa died (grief to anger). On songs like On That Time, Stop Breathing and No Sl33p, he opens up on how he felt, displaying anger, sometimes sadness and vengence for his friend. Ye would be the executive producer for the album, and it would see a release on Christmas Day, 2020.",
  "Whole Lotta Red (Deluxe)": "One day after Whole Lotta Red's release, Carti took to Twitter to ask fans which songs they wanted on the deluxe edition, marking the first time he had ever planned a deluxe release for one of his projects. Many of the songs considered for the deluxe were well-known leaks, alongside potential new tracks created specifically for the project. These songs underwent multiple tweaks and changes, such as mixing, mastering, and even name changes, in preparation for an official release. So far, two tracklist versions of the deluxe have been revealed by insiders and leakers, with speculation that more versions may exist but have yet to surface. Unfortunately, Carti eventually went silent about the deluxe, and the project was ultimately shelved. It is rumored that the label did not allow him to release the deluxe, forcing him to abandon the project in favor of focusing on his next album, NARCISSIST.",
  "Ye - DONDA": "Donda was an opportunity used by Carti as a \"rollout\" to showcase his new, somewhat softer, and more relaxed sound used on his now-scrapped album \"Narcissist\". Based on snippets and leaks, Ye West not only helped Carti develop a foundation for the album, but he also gave inspiration and introduced him to the sounds he uses today. Despite the non-launch of Narcissist, Carti used Donda as a stepping stone to his new works of music.",
  "Narcissist": "After shelving the WLR Deluxe, Carti entered his most mysterious era. He announced Narcissist for September 13, 2021, but it never dropped due to sample clearance issues and its similarities to Future's sound. Fans speculated the album might be called Mollyworld after a fit pic caption, but Narcissist was the final name. The project hinted at a futuristic, sample-heavy sound, blending Carti's fading \"baby voice\" with a developing deeper tone — a shift later heard on Travis Scott's \"FE!N.\" Leaks like \"Ready to Crash\" and \"Too Hot\" showcased his evolving style. Despite a producer lineup that included Richie Souf, F1lthy, and Art Dealer, the album was scrapped, and the tour was renamed King Vamp. The only official release was a controversial merch line. Despite multiple sources claiming it's not an album, Carti posted a screenshot revealing the existence of this album.",
  "MUSIC [V1]": "In early 2023, anticipation for Playboi Carti's next album was through the roof. He had just previewed \"ROCKSTARZ\" at Rolling Loud California, and it felt like the album could drop any week. Around this time, DJ Swamp Izzo emerged as a trusted insider in the Carti community, sharing key info in DMs with a fan. He claimed Carti had a few possible titles in mind, despite previously teasing the name MUSIC in 2022, and said the official title would drop in two weeks—which never happened. This led to speculation about whether this was a new project, or just MUSIC under a different name. Swamp also mentioned that about 25 tracks were in consideration and hinted at an April or May release. Swamp stated that he would speak over each song—something that later became a main gimmick of MUSIC when it released—and that the sound for the tape was inspired by Lil Wayne, with Carti blending all of his sounds together with a touch of 2000s Atlanta trap. After two grueling years of constant blueballing, Carti finally dropped MUSIC, and once it was out, more details surfaced about the behind-the-scenes process. In an April 2025 interview, Swamp Izzo revealed Carti had completed an entire tape by the end of 2022—but no tracks from it made the final tracklist for MUSIC.",
  "004KT": "004KT, stylized as 004KTWHOYOUHATE?, is a (likely scrapped) collaboration project between Playboi Carti and NBA Youngboy, first teased in February 2023 when DJ Swamp Izzo claimed that 'YoungBoys tape with Carti is almost done'. Then, in the summer of 2023, Carti gifted YoungBoy an opium chain and then posted a picture of YoungBoy wearing the chain. F1LTHY also tweeted the words '004KT' (00 meaning Opium and 4KT standing for YoungBoys label) hinting at his potetional involvement in a collaboration between the two. The album was in the works up until early 2024, when YoungBoy was raided and arrested for running a large scale drug ring.",
  "MUSIC [V2]": "After the rollout for the 'GUAPO' era of MUSIC died down, Carti would go back into a hiatus, however, this wouldn't last for long, as Carti was booked for multiple festivals across Europe in the summer of 2023. And during this time of being in Europe, Carti would rent out a cave in Paris, and record various songs there. The songs recorded here were more experimental, and not like the rest of his music. Songs like POP OUT, MEET YO MAKER, and DOCTOR were all recorded in these caves, and most of the songs recorded here were produced by either Pi'erre Bourne or F1LTHY. Carti would eventually end up going back on this cave sound and exploring a darker theme, the only songs from this era (that we know of atleast) seeing an official release being POP OUT and RADAR. The cover for this era is actually a fake cover after the creator behind the cover lied about \"cartis team considering it\", when in reality it was only an auto-reply email. The cover was originally posted on IG as a fan art. Inspired by \"Eaten Back To Life\" by Cannibal Corpse.",
  "CARTI YE": "CARTI YE is a collaborative project between Playboi Carti and Kanye West. Little is known of the album, except that sessions for the project took place and it was ultimately scrapped. Kanye posted the album cover on X on March 15, 2025, alongside confirming that the project was discontinued. Later on December 11, 2025, on a stream with Cuffem, F1LTHY would come out months later and claim that it was actually a track meant for their scrapped collaborative album. So Ye uploading it without Carti was part of the episode he was having at the time, starting a beef with Carti. YoungBoy for his part, decided to stick to Carti's side, which would bring back the 004KT duo from 2022-2023 to the public, generating more anticipation for their future tracks together.",
  "MUSIC [V3]": "Playboi Carti's third studio album, MUSIC, was released on March 14, 2025. After a failed rollout in January 2023, Carti revamped the album concept, embracing a darker, gothic, and metal-inspired musical aesthetic. This new sound was driven by gritty beats, mainly produced by Cardo Got Wings, and a mix of deep, menacing vocal delivery with his signature whispery, melodic style. In 2023, Carti largely went silent, resurfacing in July with a feature on Travis Scott's UTOPIA on the track \"FE!N,\" which showcased his newly adopted deep vocal tone. In December 2023, he dropped the first single, \"DIFFERENT DAY,\" followed by \"2024,\" which highlighted both his vocal range and a shift toward sample-based production. Singles like \"HBA,\" \"BACKR00MS\" with Travis Scott, \"EVIL J0RDAN,\" and \"KETAMINE\" continued to generate anticipation. He also featured on major projects, including VULTURES 1 and We Don't Trust You, maintaining his presence in the spotlight. The album's release in March 2025 was highly anticipated, marking a significant evolution in Carti's sound.",
  "VULTURES": "Carti was a frequent collaborator for Ye and Ty Dolla $ign's joint trilogy (cut by two volumes), Vultures. MUSIC was even delayed because of the delays and reworks these albums had. During this sub-era, Carti would do some changes to his own project due to Ye's influence. Even though only a very few songs were released or leaked, it's believed that the Vultures team and Carti may have worked on much more material together.",
  "BABY BOI": "In 2023, Carti would confirm in a facetime call that he planned to drop 2 albums: MUSIC and BABY BOI. The plans for BABY BOI are unknown, however, Carti has alluded to it multiple times after the release of MUSIC, claiming it will come soon. Insiders have also said the album will drop before the end of 2025, with Carti consistently reiterating that it will drop before the end of 2025 as well. It was planned to drop but was cancelled."
};

export const FILTER_TOOLTIPS: Record<string, string> = {
  'Snippet': 'Less than a minute of the song is available.',
  'Partial': 'More than a minute of the song is available.',
  'Beat Only': 'Only the instrumental of the song is available.',
  'Tagged': 'Full song is available, but with added tags not from the song itself.',
  'Stem Bounce': 'Full song that has been exported by anyone else who was not the intended person.',
  'Full': 'The entire song is available, but not the original file.',
  'OG File': 'The original entire file of a song is available.',
  'Confirmed': 'The song is unavailable, but has been confirmed to exist by people who have worked with Kanye.',
  'Rumored': 'The song is unavailable, but has been said to exist by reputable people within the leak community. Please take with a grain of salt.',
  'Conflicting Sources': "There have been reputable people who say the song does exist and reputable people who say the song doesn't exist. As it is not our place to say who's right or wrong, songs with conflicting sources will be marked as such.",

  'Not Available': 'Placeholder for unavailable songs.',
  'Recording': 'A non-digital copy is available. Usually live performances or someone playing the song.',
  'Low Quality': 'Anything lower than 128kbps (YouTube quality). Noticeably worse than High Quality or CD Quality.',
  'High Quality': 'Anything greater than or equal to 128kbps (YouTube quality) and less than 320kbps.',
  'CD Quality': 'Anything around 320kbps. Not a noticeable difference to Lossless quality.',
  'Lossless': 'Raw audio data, usually from leaked stems or sessions. Useful for audio editing, but not noticeably different to CD Quality.'
};

export const createSlug = (name: string) => encodeURIComponent(
  name
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
);

export function getSongSlug(song: any, allSongsInCollection: any[]): string {
  if (!song || !song.name) return 'NoName1';
  
  if (song.name.includes('???') || createSlug(song.name) === '') {
    let index = 1;
    const targetUrl = song.url || (song.urls && song.urls.length > 0 ? song.urls[0] : '');
    for (const s of allSongsInCollection) {
      if ((s.name && s.name.includes('???')) || createSlug(s.name) === '') {
        const sUrl = s.url || (s.urls && s.urls.length > 0 ? s.urls[0] : '');
        if (s.name === song.name && sUrl === targetUrl && s.description === song.description) {
          return `NoName${index}`;
        }
        index++;
      }
    }
    return `NoName1`;
  }
  return createSlug(song.name) || 'NoName1';
}

export function getArtistName(_eraName: string | undefined): string {
  return "Playboi Carti";
}

export function buildArtistTag(songName: string, eraName: string | undefined): string {
  let primary: string;
  const dashIdx = songName.indexOf(' - ');
  if (dashIdx !== -1) {
    primary = songName.substring(0, dashIdx);
    Object.keys(TAG_MAP).forEach(emoji => { primary = primary.replaceAll(emoji, ''); });
    primary = primary.replace(/[️]/g, '').trim();
  } else {
    primary = getArtistName(eraName);
  }

  const featMatch = songName.match(/\(feat\.\s*([^)]+)\)/i);
  if (featMatch) {
    return `${primary} feat. ${featMatch[1].trim()}`;
  }
  return primary;
}

export const TAG_MAP: Record<string, string> = {
  '⭐': 'Best Of',
  '🏆': 'Grails',
  '🥇': 'Wanted',
  '🏅': 'Wanted',
  '✨': 'Special',
  '💛': 'By YƵYGOLD',
  '🗑️': 'Worst Of',
  '🗑': 'Worst Of',
  '🚮': 'Unwanted',
  '🤖': 'AI',
  '⁉️': 'Lost Media',
  '⁉': 'Lost Media',
  '❓': 'Unknown'
};

export function formatTextForNotification(text: string | undefined | null, tagsAsEmojis: boolean): string {
  if (!text) return '';
  let formattedText = text;
  const tags: string[] = [];

  Object.entries(TAG_MAP).forEach(([emoji, tag]) => {
    if (formattedText.includes(emoji)) {
      if (!tagsAsEmojis) {
        tags.push(`[${tag.toUpperCase()}]`);
      }
      formattedText = formattedText.split(emoji).join('').trim();
    }
  });

  formattedText = formattedText.replace(/[\uFE0F]/g, '').trim();

  if (tagsAsEmojis) {
    return text;
  }

  if (tags.length === 0) {
    return formattedText;
  }

  return `${formattedText} ${tags.join(' ')}`.trim();
}

export function formatTextWithTags(text: string | undefined | null) {
  if (!text) return null;

  let formattedText = text;
  const tags: { emoji: string, tag: string }[] = [];

  Object.entries(TAG_MAP).forEach(([emoji, tag]) => {
    if (formattedText.includes(emoji)) {
      tags.push({ emoji, tag });
      formattedText = formattedText.split(emoji).join('').trim();
    }
  });

  formattedText = formattedText.replace(/[\uFE0F]/g, '').trim();

  if (tags.length === 0) {
    return <>{formattedText}</>;
  }

  return <FormattedTextWithTags tags={tags} formattedText={formattedText} />;
}

function TagComponent({ t, tagsAsEmojis }: { t: { emoji: string, tag: string }, tagsAsEmojis: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const tooltipText = TAG_TOOLTIP_MAP[t.tag];

  const updateRect = () => {
    if (tagRef.current) {
      setRect(tagRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    if (isHovered) {
      updateRect();
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);
      return () => {
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
      };
    }
  }, [isHovered]);

  useEffect(() => {
    if (isHovered) {
      const handleDocClick = (e: MouseEvent) => {
        if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
          setIsHovered(false);
        }
      };
      const timer = setTimeout(() => {
        document.addEventListener('click', handleDocClick);
        document.addEventListener('touchstart', handleDocClick);
      }, 10);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleDocClick);
        document.removeEventListener('touchstart', handleDocClick);
      };
    }
  }, [isHovered]);

  return (
    <div 
      ref={tagRef}
      className="relative flex items-center shrink-0 cursor-help"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsHovered(!isHovered);
      }}
    >
      {tagsAsEmojis ? (
        <span className="shrink-0 flex items-center justify-center text-sm">{t.emoji}</span>
      ) : (
        <span className="shrink-0 flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/10 bg-[var(--theme-color)]/10 text-[var(--theme-color)] font-bold">
          {t.tag}
        </span>
      )}

      {tooltipText && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isHovered && rect && (
            <motion.div
              initial={{ opacity: 0, x: "-50%", y: "calc(-100% + 5px)", filter: 'blur(4px)', scale: 0.95 }}
              animate={{ opacity: 1, x: "-50%", y: "-100%", filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, x: "-50%", y: "calc(-100% + 5px)", filter: 'blur(4px)', scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              style={{
                position: 'fixed',
                left: rect.left + rect.width / 2,
                top: rect.top - 8,
                zIndex: 99999,
                transformOrigin: 'bottom center'
              }}
              className="w-48 sm:w-64 p-3 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl pointer-events-none"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-base flex items-center justify-center text-[var(--theme-color)]">{t.emoji}</span>
                  <span className="font-bold text-white text-xs">{t.tag}</span>
                </div>
                <p className="text-white/70 text-[11px] leading-snug whitespace-normal line-clamp-3">
                  {tooltipText}
                </p>
              </div>
              <div className="absolute top-full left-1/2 -ml-1.5 -mt-[1px] border-solid border-t-neutral-900 border-x-transparent border-b-transparent border-[6px]" />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function FormattedTextWithTags({ tags, formattedText }: { tags: { emoji: string, tag: string }[], formattedText: string }) {
  const { settings } = useSettings();
  
  return (
    <div className="flex items-center gap-1.5 truncate">
      <span className="truncate">{formattedText}</span>
      {tags.map((t, i) => (
        <TagComponent key={i} t={t} tagsAsEmojis={settings.tagsAsEmojis} />
      ))}
    </div>
  );
}

export function getCleanSongNameWithTags(text: string | undefined | null): string {
  if (!text) return '';
  let formattedText = text;
  const tags: string[] = [];

  Object.entries(TAG_MAP).forEach(([emoji, tag]) => {
    if (formattedText.includes(emoji)) {
      tags.push(tag);
      formattedText = formattedText.split(emoji).join('').trim();
    }
  });

  formattedText = formattedText.replace(/[\uFE0F]/g, '').trim();

  if (tags.length > 0) {
    return `${formattedText} [${tags.join(', ')}]`;
  }
  return formattedText;
}

export interface SongMeta {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  artworkUrl?: string;
}

export async function detectAudioExt(blob: Blob): Promise<'.mp3' | '.wav' | '.flac' | '.aiff' | '.zip'> {
  const header = await blob.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(header);
  // RIFF....WAVE
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return '.wav';
  // fLaC
  if (bytes[0] === 0x66 && bytes[1] === 0x4C && bytes[2] === 0x61 && bytes[3] === 0x43) return '.flac';
  // FORM....AIFF or AIFC
  if (bytes[0] === 0x46 && bytes[1] === 0x4F && bytes[2] === 0x52 && bytes[3] === 0x4D) return '.aiff';
  // PK (ZIP)
  if (bytes[0] === 0x50 && bytes[1] === 0x4B) return '.zip';
  return '.mp3';
}

function isImageBuffer(buf: ArrayBuffer): boolean {
  const b = new Uint8Array(buf, 0, 12);
  // JPEG: FF D8
  if (b[0] === 0xFF && b[1] === 0xD8) return true;
  // PNG: 89 50 4E 47
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return true;
  // GIF: 47 49 46
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return true;
  // WebP: 52 49 46 46 .... 57 45 42 50
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return true;
  return false;
}

async function fetchArtworkBuffer(artworkUrl: string): Promise<ArrayBuffer | null> {
  const proxies = [
    artworkUrl,
    `https://corsproxy.io/?${encodeURIComponent(artworkUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(artworkUrl)}`,
  ];
  for (const url of proxies) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const buf = await res.arrayBuffer();
        if (isImageBuffer(buf)) return buf;
      }
    } catch {
      // try next proxy
    }
  }
  return null;
}

export async function embedID3Tags(blob: Blob, meta: SongMeta, cleanTitle: string): Promise<Blob> {
  const audioBuffer = await blob.arrayBuffer();
  const writer = new ID3Writer(audioBuffer);

  if (meta.title || cleanTitle) writer.setFrame('TIT2', meta.title || cleanTitle);
  if (meta.artist) writer.setFrame('TPE1', [meta.artist]);
  if (meta.album) writer.setFrame('TALB', meta.album);
  if (meta.year) {
    const yearNum = parseInt(meta.year, 10);
    if (!isNaN(yearNum)) writer.setFrame('TYER', yearNum);
  }

  if (meta.artworkUrl) {
    const artBuffer = await fetchArtworkBuffer(meta.artworkUrl);
    if (artBuffer) {
      writer.setFrame('APIC', {
        type: 3,
        data: artBuffer,
        description: 'Cover',
      });
    }
  }

  writer.addTag();
  return writer.getBlob();
}

function openFallback(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function isInAppBrowser(): boolean {
  const ua = navigator.userAgent;
  // Google app (GSA), Facebook, Instagram, and similar WebViews don't support saveAs
  return /GSA\/|FBAN|FBAV|Instagram\//.test(ua);
}

function parseOgFilename(description: string | undefined): string | null {
  if (!description) return null;
  const match = description.match(/^OG Filename:\s*(.+)$/im);
  if (!match) return null;
  const raw = match[1].trim().replace(/^["']|["']$/g, '');
  // Strip known audio extensions so extension logic below can normalize them
  return raw.replace(/\.(mp3|wav|flac|aif|aiff|m4a|ogg)$/i, '');
}

export async function resolveUrl(url: string): Promise<{ fetchUrl: string; isImage: boolean; imageExt?: string }> {
  if (url.includes('temp.imgur.gg/f/')) {
    const id = url.split('/f/')[1];
    if (id) {
      const res = await fetch(`https://temp.imgur.gg/api/file/${id}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.cdnUrl) return { fetchUrl: data.cdnUrl, isImage: false };
      }
    }
    return { fetchUrl: url, isImage: false };
  }
  if (url.includes('pillows.su/f/')) {
    const hash = url.split('/f/')[1]?.split('/')[0]?.split('?')[0];
    return { fetchUrl: hash ? `https://api.pillows.su/api/get/${hash}` : url, isImage: false };
  }
  if (url.includes('ibb.co')) {
    const apiRes = await fetch(`https://imgbb-file-get-api.vercel.app/api?url=${url}`).catch(() => null);
    if (apiRes && apiRes.ok) {
      const apiData = await apiRes.json().catch(() => null);
      if (apiData?.direct_link) return { fetchUrl: apiData.direct_link, isImage: true };
    }
    return { fetchUrl: url, isImage: true };
  }
  if (url.match(/\.(png|jpg|jpeg)$/i) || url.startsWith('https://i.scdn.co/')) {
    const match = url.match(/\.(png|jpg|jpeg)$/i);
    return { fetchUrl: url, isImage: true, imageExt: match ? match[0] : '.png' };
  }
  return { fetchUrl: url, isImage: false };
}

export async function handleDownloadFile(url: string, suggestedName: string, tagsAsEmojis: boolean, meta?: SongMeta, description?: string) {
  if (!url) return;
  try {
    let finalUrl = url;
    const ogName = parseOgFilename(description);
    let fileName = ogName ?? suggestedName;
    if (!tagsAsEmojis && !ogName) {
      fileName = formatTextForNotification(suggestedName, false);
    }

    let isImage = false;
    let ext = '.mp3';

    if (url.includes('temp.imgur.gg/f/')) {
        const id = url.split('/f/')[1];
        if (id) {
            const res = await fetch(`https://temp.imgur.gg/api/file/${id}`).catch(() => null);
            if (res && res.ok) {
                const data = await res.json().catch(() => null);
                if (data?.cdnUrl) finalUrl = data.cdnUrl;
            }
        }
    } else if (url.includes('pillows.su/f/')) {
        const hash = url.split('/f/')[1]?.split('/')[0]?.split('?')[0];
        if (hash) {
            finalUrl = `https://api.pillows.su/api/get/${hash}`;
        }
    } else if (url.includes('ibb.co')) {
       isImage = true;
       ext = '';
       const apiRes = await fetch(`https://imgbb-file-get-api.vercel.app/api?url=${url}`).catch(() => null);
       if (apiRes && apiRes.ok) {
           const apiData = await apiRes.json().catch(() => null);
           if (apiData && apiData.direct_link) {
               finalUrl = apiData.direct_link;
           }
       }
    } else if (url.match(/\.(png|jpg|jpeg)$/i) || url.startsWith('https://i.scdn.co/')) {
        isImage = true;
        const match = url.match(/\.(png|jpg|jpeg)$/i);
        ext = match ? match[0] : '.png';
    } 

    if (!fileName.endsWith('.mp3') && !isImage) {
        fileName += ext;
    } else if (isImage && !fileName.match(/\.(png|jpg|jpeg)$/i)) {
        fileName += ext;
    }

    // In-app browsers (Google app, Facebook, Instagram) don't support saveAs via
    // the download attribute. Navigate directly to the download URL so the OS
    // download manager or system browser can handle it. Use the /api/download/
    // path (which includes the filename) so the server sends Content-Disposition:
    // attachment, triggering a real download instead of inline playback.
    if (isInAppBrowser()) {
      let directUrl = finalUrl;
      if (url.includes('pillows.su/f/')) {
        const pathPart = url.split('/f/')[1];
        if (pathPart) directUrl = `https://api.pillows.su/api/download/${pathPart}`;
      }
      window.location.href = directUrl;
      return;
    }

    let blob: Blob;
    try {
      const getWithTimeout = async (requestUrl: string, timeoutMs: number) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch(requestUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          return res;
        } catch (err) {
          clearTimeout(timeoutId);
          return null;
        }
      };

      let response = await getWithTimeout(finalUrl, 3000);
      
      if (!response || !response.ok) {
        if (isImage) {
          const proxies = [
            `https://corsproxy.io/?${encodeURIComponent(finalUrl)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(finalUrl)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(finalUrl)}`
          ];
          
          for (const proxy of proxies) {
            response = await getWithTimeout(proxy, 4000);
            if (response && response.ok) break;
          }
          
          if (!response || !response.ok) {
             throw new Error("All proxies failed");
          }
        } else {
          throw new Error("Network error");
        }
      }
      blob = await response.blob();
      if (!isImage) {
        const actualExt = await detectAudioExt(blob);
        if (actualExt !== '.mp3' && fileName.endsWith('.mp3')) {
          fileName = fileName.slice(0, -4) + actualExt;
        }

        if (meta && actualExt === '.mp3') {
          const cleanTitle = meta.title || formatTextForNotification(suggestedName, false);
          try {
            blob = await embedID3Tags(blob, meta, cleanTitle);
          } catch (e) {
            console.warn('ID3 tagging failed, saving without tags:', e);
          }
        }
      }
    } catch (e) {
      console.error('Download failed:', e);
      openFallback(url);
      return;
    }

    saveAs(blob, fileName);
  } catch (e) {
    console.error('Download failed:', e);
    openFallback(url);
  }
}

export function isSongNotAvailable(song: any, rawUrl: string): boolean {
  if (song.quality?.toLowerCase() === 'not available') return true;
  if (!rawUrl) return false;
  const lowerUrl = rawUrl.toLowerCase().trim();
  return lowerUrl.includes('link needed') || lowerUrl.includes('link%20needed') || lowerUrl.includes('source needed') || lowerUrl.includes('source%20needed') || lowerUrl === 'n/a';
}

export function parseDurationToSeconds(duration: string | undefined): number {
  if (!duration) return 0;

  if (!duration.includes(':')) {
    const num = Number(duration);
    return isNaN(num) ? 0 : num;
  }

  const parts = duration.split(':').map(Number);
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  } else if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return 0;
}

export function matchesFilters(song: any, searchQuery: string, filters: any): boolean {
  const lowerQuery = searchQuery.toLowerCase();
  const searchMatch = !searchQuery ||
    song.name.toLowerCase().includes(lowerQuery) ||
    (song.extra && song.extra.toLowerCase().includes(lowerQuery)) ||
    (song.description && song.description.toLowerCase().includes(lowerQuery));

  if (!searchMatch) return false;

  if (filters.tags && filters.tags.length > 0) {
    const hasAllTags = filters.tags.every((tagEmoji: string) => {
      return (song.name && song.name.includes(tagEmoji)) ||
        (song.extra && song.extra.includes(tagEmoji)) ||
        (song.fakesType && song.fakesType.toLowerCase().includes(tagEmoji.toLowerCase()));
    });

    if (!hasAllTags) {
      return false;
    }
  }

  if (filters.excludedTags && filters.excludedTags.length > 0) {
    const hasExcludedTag = filters.excludedTags.some((tagEmoji: string) => {
      return (song.name && song.name.includes(tagEmoji)) ||
        (song.extra && song.extra.includes(tagEmoji)) ||
        (song.fakesType && song.fakesType.toLowerCase().includes(tagEmoji.toLowerCase()));
    });
    if (hasExcludedTag) {
      return false;
    }
  }

  if (filters.qualities && filters.qualities.length > 0) {
    const hasAnyQuality = filters.qualities.some((quality: string) => {
      return (song.quality && song.quality.toLowerCase().includes(quality.toLowerCase())) ||
             (song.fakesLength && song.fakesLength.toLowerCase().includes(quality.toLowerCase()));
    });
    if (!hasAnyQuality) {
      return false;
    }
  }

  if (filters.excludedQualities && filters.excludedQualities.length > 0) {
    const hasExcludedQuality = filters.excludedQualities.some((quality: string) => {
      return (song.quality && song.quality.toLowerCase().includes(quality.toLowerCase())) ||
             (song.fakesLength && song.fakesLength.toLowerCase().includes(quality.toLowerCase()));
    });
    if (hasExcludedQuality) {
      return false;
    }
  }

  if (filters.availableLengths && filters.availableLengths.length > 0) {
    const hasAnyLength = filters.availableLengths.some((len: string) => {
      return song.available_length && song.available_length.toLowerCase().includes(len.toLowerCase());
    });
    if (!hasAnyLength) {
      return false;
    }
  }

  if (filters.excludedAvailableLengths && filters.excludedAvailableLengths.length > 0) {
    const hasExcludedLength = filters.excludedAvailableLengths.some((len: string) => {
      return song.available_length && song.available_length.toLowerCase().includes(len.toLowerCase());
    });
    if (hasExcludedLength) {
      return false;
    }
  }

  if (filters.durationValue && filters.durationValue.trim() !== '') {
    const songSeconds = parseDurationToSeconds(song.track_length);
    if (!songSeconds) return false;

    let targetSeconds = 0;
    if (!filters.durationValue.includes(':')) {
      const raw = Number(filters.durationValue);
      targetSeconds = !isNaN(raw) ? raw * 60 : 0;
    } else {
      targetSeconds = parseDurationToSeconds(filters.durationValue);
    }

    if (filters.durationOp === '>') {
      if (songSeconds <= targetSeconds) return false;
    } else if (filters.durationOp === '<') {
      if (songSeconds >= targetSeconds) return false;
    } else if (filters.durationOp === '=') {
      if (songSeconds !== targetSeconds) return false;
    }
  }

  if (filters.playableOnly) {
    const rawUrl = song.url || (song.urls && song.urls.length > 0 ? song.urls[0] : '');
    const isNotAvailable = song.quality?.toLowerCase() === 'not available';
    if (!rawUrl || !rawUrl.includes('pillows.su/f/') || isNotAvailable) {
      return false;
    }
  }

  if (filters.albums && filters.albums.length > 0) {
    const hasAnyAlbum = filters.albums.some((album: string) => {
      const songAlbum = song.extra2 || song.realEra?.name || song.extra;
      return songAlbum && songAlbum.toLowerCase() === album.toLowerCase();
    });
    if (!hasAnyAlbum) {
      return false;
    }
  }


  return true;
}
