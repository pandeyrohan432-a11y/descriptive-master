const LETTERS=['A','B','C','D','E'];
const q=(id,section,text,options,answer,solution)=>({id,section,q:text,options,answer,solution});
const pos=(correct,distractors,p)=>{const a=[correct,...distractors];const out=[];for(let i=0;i<5;i++)out.push(a[(i-p+5)%5]);return {options:out,answer:LETTERS[p]};};

function build(){
 const out=[];
 const eng=[
  ['Choose the correct sentence.',['He does not like tea.','He do not like tea.','He does not likes tea.','He did not likes tea.','He doing not like tea.'],'A','Singular subject he takes does not + base verb.'],
  ['She is good ___ mathematics.',['at','in','on','for','with'],'A','The standard expression is good at.'],
  ['Choose the correctly spelt word.',['Accommodation','Accomodation','Acommodation','Accommadation','Acomodation'],'A','Accommodation is the correct spelling.'],
  ['Neither Riya nor her friends ___ ready.',['are','is','was','has','be'],'A','The verb agrees with the nearer plural subject friends.'],
  ['Synonym of Brief:',['Concise','Long','Weak','Dull','Late'],'A','Brief means concise.'],
  ['Antonym of Ancient:',['Modern','Old','Historic','Former','Past'],'A','Modern is the opposite of ancient.'],
  ['The train arrived ___ time.',['on','at','in','by','for'],'A','The expression is on time.'],
  ['Choose the correct sentence.',['Each of the boys has a book.','Each of the boys have a book.','Each boys has a book.','Each of boys have book.','Each of the boy have a book.'],'A','Each takes a singular verb.'],
  ['Synonym of Abundant:',['Plentiful','Scarce','Tiny','Empty','Rare'],'A','Abundant means plentiful.'],
  ['Antonym of Expand:',['Contract','Increase','Extend','Develop','Spread'],'A','Contract is the opposite of expand.'],
  ['He has been working here ___ 2022.',['since','for','from','by','at'],'A','Since is used with a starting point.'],
  ['Choose the correct sentence.',['I saw him yesterday.','I have seen him yesterday.','I had see him yesterday.','I see him yesterday.','I have saw him yesterday.'],'A','A completed past action with yesterday uses simple past.'],
  ['If I ___ rich, I would help the poor.',['were','am','was','be','had'],'A','Were is used in this hypothetical conditional.'],
  ['Synonym of Candid:',['Frank','Hidden','Cruel','Careless','Silent'],'A','Candid means frank or honest.'],
  ['Antonym of Diligent:',['Lazy','Hardworking','Active','Careful','Prompt'],'A','Lazy is opposite to diligent.'],
  ['The manager insisted ___ punctuality.',['on','in','at','for','with'],'A','The expression is insist on.'],
  ['Choose the correct sentence.',['She is senior to me.','She is senior than me.','She is senior from me.','She senior to me.','She is senior with me.'],'A','Senior is followed by to.'],
  ['Synonym of Reluctant:',['Unwilling','Eager','Ready','Happy','Certain'],'A','Reluctant means unwilling.'],
  ['Antonym of Transparent:',['Opaque','Clear','Bright','Open','Visible'],'A','Opaque is the opposite of transparent.'],
  ['There are ___ apples in the basket.',['many','much','little','less','any'],'A','Many is used with plural countable nouns.'],
  ['Choose the correct sentence.',['The news is good.','The news are good.','The news were good.','News are a good.','The news have good.'],'A','News is treated as singular.'],
  ['Synonym of Vital:',['Essential','Useless','Optional','Minor','Weak'],'A','Vital means essential.'],
  ['Antonym of Rigid:',['Flexible','Stiff','Hard','Fixed','Strict'],'A','Flexible is opposite to rigid.'],
  ['She prefers tea ___ coffee.',['to','than','over','from','with'],'A','Prefer is normally followed by to.'],
  ['Choose the correct sentence.',['He is one of the best players.','He is one of the best player.','He is one of best players.','He one of the best players.','He is one best player.'],'A','One of the best is followed by a plural noun.'],
  ['Synonym of Mitigate:',['Reduce','Worsen','Ignore','Create','Delay'],'A','Mitigate means reduce the severity.'],
  ['Antonym of Scarce:',['Abundant','Rare','Limited','Small','Short'],'A','Abundant is opposite to scarce.'],
  ['By next month, she ___ the course.',['will have completed','completes','completed','has completed','completing'],'A','By a future time calls for future perfect.'],
  ['Choose the correct sentence.',['No sooner did he arrive than it rained.','No sooner he arrived than it rained.','No sooner he had arrived when it rained.','No sooner did he arrived than it rained.','No sooner has he arrive than it rained.'],'A','No sooner uses inversion and than.'],
  ['Synonym of Prudent:',['Wise','Foolish','Hasty','Careless','Weak'],'A','Prudent means wise and careful.']
 ];
 eng.forEach((x,i)=>out.push(q(i+1,'English',x[0],x[1],x[2],x[3])));

 const addCalc=(id,text,correct,ds,solution)=>{const p=id%5;const z=pos(String(correct),ds.map(String),p);out.push(q(id,'Numerical Ability',text,z.options,z.answer,solution));};
 const vals=[
  [31,'What is 25% of 480?',120,[100,125,140,160],'480 × 25/100 = 120.'],
  [32,'If 3x = 72, find x.',24,[18,20,22,26],'x = 72/3 = 24.'],
  [33,'A number is increased by 20% from 250. New number?',300,[280,290,310,320],'250 × 1.20 = 300.'],
  [34,'Average of 18, 24 and 30?',24,[22,26,28,30],'(18+24+30)/3 = 24.'],
  [35,'CP ₹800, SP ₹920. Profit percent?',15,[10,12,18,20],'Profit = 120; 120/800 × 100 = 15%.'],
  [36,'360 km in 6 hours. Speed?',60,[50,55,65,70],'360/6 = 60 km/h.'],
  [37,'SI on ₹5000 at 8% for 2 years?',800,[600,700,900,1000],'5000×8×2/100 = ₹800.'],
  [38,'Ratio 45:60 in simplest form?', '3:4',['2:3','4:5','5:6','6:7'],'Divide both terms by 15.'],
  [39,'A does work in 12 days, B in 18 days. Together?',7.2,[6,8,9,10],'Rate = 1/12+1/18 = 5/36, so time = 36/5 = 7.2 days.'],
  [40,'₹1200 divided in ratio 2:3. Larger share?',720,[400,480,600,800],'Larger share = 3/5 × 1200 = ₹720.'],
  [41,'40% of a number is 96. Number?',240,[200,220,260,280],'96/0.4 = 240.'],
  [42,'A person saves ₹5000 after spending 75%. Income?',20000,[15000,18000,22000,25000],'Saving is 25%; 5000/0.25 = ₹20000.'],
  [43,'HCF of 36 and 48?',12,[6,8,10,16],'Highest common factor is 12.'],
  [44,'LCM of 12 and 18?',36,[24,30,48,54],'LCM is 36.'],
  [45,'5 pens cost ₹75. Cost of 8?',120,[100,110,125,130],'One pen = ₹15; eight = ₹120.'],
  [46,'Simplify: 48 ÷ 6 × 3 + 4.',28,[24,30,32,36],'48÷6=8; 8×3=24; +4 = 28.'],
  [47,'Simplify: 15 + 6 × 4 − 8.',31,[27,29,33,35],'6×4=24; 15+24−8 = 31.'],
  [48,'√625 = ?',25,[20,30,35,40],'25×25 = 625.'],
  [49,'3/5 of 250?',150,[100,125,175,200],'250×3/5 = 150.'],
  [50,'10% discount on ₹1500. Selling price?',1350,[1250,1300,1400,1450],'Discount = ₹150; price = ₹1350.'],
  [51,'48 km in 4 hours. Speed?',12,[10,14,16,18],'48/4 = 12 km/h.'],
  [52,'Rectangle perimeter 50 cm, length 15 cm. Breadth?',10,[8,12,15,20],'L+B=25; breadth = 10 cm.'],
  [53,'Area of rectangle 18 cm × 7 cm?',126,[112,136,144,154],'18×7 = 126 cm².'],
  [54,'5 km north then 12 km east. Straight distance?',13,[11,12,14,17],'√(5²+12²) = 13 km.'],
  [55,'x:y=4:7 and x=20. y?',35,[28,30,32,40],'One part = 5; y = 35.'],
  [56,'₹2000 item after 15% discount?',1700,[1600,1650,1750,1800],'15% of 2000 = 300; price = 1700.'],
  [57,'30% less than 500?',350,[300,325,375,400],'70% of 500 = 350.'],
  [58,'120 km at 40 km/h. Time?',3,[2,2.5,3.5,4],'120/40 = 3 hours.'],
  [59,'7 workers finish in 12 days. 14 workers need?',6,[4,5,7,8],'7×12/14 = 6 days.'],
  [60,'Average of 5 numbers is 26. Sum?',130,[120,125,135,140],'26×5 = 130.'],
  [61,'₹900 sold at 20% profit. SP?',1080,[1000,1050,1100,1120],'900×1.20 = ₹1080.'],
  [62,'Pipe fills tank in 15 min. Fraction in 5 min?', '1/3',['1/2','1/4','2/3','3/4'],'5/15 = 1/3.'],
  [63,'18% of 750?',135,[125,140,150,160],'750×18/100 = 135.'],
  [64,'A sum doubles in 5 years at SI. Rate?',20,[10,15,25,30],'Interest equals principal; rate = 100/5 = 20%.'],
  [65,'2/3 of a number is 80. Number?',120,[100,110,130,140],'80×3/2 = 120.']
 ];
 vals.forEach(v=>addCalc(...v));

 const addR=(id,text,correct,ds,solution)=>{const p=id%5;const z=pos(String(correct),ds.map(String),p);out.push(q(id,'Reasoning Ability',text,z.options,z.answer,solution));};
 const series=[
  [66,'Next: 2, 4, 8, 16, ?',32,[24,28,30,36],'Multiply by 2.'],
  [67,'Next: 5, 10, 17, 26, ?',37,[35,36,38,39],'Differences are 5,7,9,11.'],
  [68,'Odd one out: Apple, Mango, Banana, Carrot, Orange.','Carrot',['Apple','Mango','Banana','Orange'],'Carrot is a vegetable; the others are fruits.'],
  [69,'If CAT → DBU, DOG → ?', 'EPH',['EOH','FPH','DPG','EPI'],'Each letter shifts one place forward.'],
  [70,'SOUTH reversed is HTUOS. BANK reversed is?', 'KNAB',['KNBA','ABNK','BNKA','KABN'],'Write the letters in reverse order.'],
  [71,"Riya says: 'He is the son of my mother's only daughter.' He is Riya's?",'Son',['Brother','Father','Uncle','Cousin'],'Her mother’s only daughter is Riya, so the man is her son.'],
  [72,'A north of B; C east of A; D south of C. D is from B?','East',['North','South','West','North-East'],'Coordinates: B(0,0), A(0,1), C(1,1), D(1,0).'],
  [73,'All pens are books. Which is definitely true?','All pens are books',['Some pens are bags','All books are pens','All bags are pens','No bags are books'],'It is directly given.'],
  [74,'20 students; Aman is 7th from left. From right?',14,[12,13,15,16],'20−7+1 = 14.'],
  [75,'P is left of Q, Q left of R, R left of S, S left of T. Middle person?', 'R',['P','Q','S','T'],'Order is P-Q-R-S-T.'],
  [76,'Next letter: A, C, F, J, O, ?', 'U',['T','V','W','X'],'Increases are +2,+3,+4,+5,+6.'],
  [77,'MANGO → NBOHP. APPLE → ?', 'BQQMF',['BQPMF','BPPMF','ZOOLE','BQQNF'],'Each letter shifts one place forward.'],
  [78,'Odd pair: 2:4, 3:9, 4:16, 5:20, 6:36.','5:20',['2:4','3:9','4:16','6:36'],'All others have second number = square of first.'],
  [79,'A taller than B, B taller than C, C taller than D. Shortest?', 'D',['A','B','C','Cannot say'],'D is below all the others.'],
  [80,'P + Q means P is father of Q; P − Q means P is sister of Q. P + Q − R: P is R’s?','Father',['Mother','Brother','Sister','Uncle'],'Q is R’s sister, and P is Q’s father, so P is R’s father.'],
  [81,'Next: 3, 6, 11, 18, 27, ?',38,[36,37,39,40],'Differences are 3,5,7,9,11.'],
  [82,'If 1 January is Monday, 8 January is?', 'Monday',['Sunday','Tuesday','Wednesday','Thursday'],'Seven days later is the same weekday.'],
  [83,'Facing east, turn left twice. Facing?', 'West',['North','South','East','North-East'],'East → North → West.'],
  [84,'In BANKING, how many letter pairs have equal gaps in word and alphabet?',1,[0,2,3,4],'Only one pair satisfies the condition.'],
  [85,'Next: 81, 27, 9, 3, ?',1,[0,2,6,9],'Divide by 3 each time.'],
  [86,'All roses are flowers; all flowers are plants. Definitely true?', 'All roses are plants',['All plants are roses','Some plants are not flowers','No roses are plants','All flowers are roses'],'Roses → flowers → plants.'],
  [87,'A is 5 places right of B. C is 3 places left of A. C is from B?', '2 places right',['1 place right','3 places right','2 places left','Same place'],'Take B=0, A=5, C=2.'],
  [88,'Next: 4, 9, 19, 39, ?',79,[69,80,81,89],'Each term = previous×2+1.'],
  [89,'PAPER → QBQFS. PEN → ?', 'QFO',['QFN','QEO','RFO','PDM'],'Each letter moves one step forward.'],
  [90,'A and F are at ends; B next to A; E next to F. Who can be in middle?', 'C or D',['A','F','B or E','A or F'],'C and D occupy the two middle positions.'],
  [91,'Odd number: 16, 25, 36, 49, 63.','63',[16,25,36,49],'All except 63 are perfect squares.'],
  [92,'Today Wednesday. After 17 days?', 'Saturday',['Thursday','Friday','Sunday','Monday'],'17 mod 7 = 3; Wednesday +3 = Saturday.'],
  [93,'At 3:00, angle between clock hands?', '90°',['60°','75°','120°','180°'],'At 3:00 the hands are perpendicular.'],
  [94,'Rahul is 9th from top and 18th from bottom. Total?',26,[25,27,28,29],'9+18−1 = 26.'],
  [95,'Next letter: Z, X, U, Q, L, ?', 'F',['G','H','I','J'],'Decreases are 2,3,4,5,6.'],
  [96,'8 workers finish in 15 days. Worker-days?',120,[100,110,130,140],'8×15 = 120 worker-days.'],
  [97,'A is mother of B; B brother of C; C sister of D; D father of E. A is E’s?', 'Grandmother',['Aunt','Mother','Sister','Cousin'],'A is mother of D, and D is E’s father.'],
  [98,'5→25, 6→36, 7→49. 9→?',81,[72,90,99,108],'The code is the square of the number.'],
  [99,'P above Q, Q above R, R above S. Bottom box?', 'S',['P','Q','R','Cannot say'],'Order is P-Q-R-S.'],
  [100,'Neha is 12th from front and 15th from back. Total?',26,[25,27,28,29],'12+15−1 = 26.']
 ];
 series.forEach(v=>addR(...v));
 return out;
}

const DATA=build();
export default function handler(req,res){
 if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
 if(req.query.id && req.query.id!=='sbi-clerk-mock-1') return res.status(404).json({error:'Mock not found'});
 if(DATA.length!==100) return res.status(500).json({error:'Mock data could not be loaded'});
 res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
 return res.status(200).json(DATA);
}
