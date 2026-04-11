// All 25 districts of Sri Lanka with province mapping and default delivery fees
const SRI_LANKA_DISTRICTS = [
  { district: 'Colombo',       province: 'Western',       fee: 200, estimatedDays: '1-2' },
  { district: 'Gampaha',       province: 'Western',       fee: 250, estimatedDays: '1-2' },
  { district: 'Kalutara',      province: 'Western',       fee: 300, estimatedDays: '1-2' },
  { district: 'Kandy',         province: 'Central',       fee: 350, estimatedDays: '2-3' },
  { district: 'Matale',        province: 'Central',       fee: 400, estimatedDays: '2-3' },
  { district: 'Nuwara Eliya',  province: 'Central',       fee: 450, estimatedDays: '2-3' },
  { district: 'Galle',         province: 'Southern',      fee: 350, estimatedDays: '2-3' },
  { district: 'Hambantota',    province: 'Southern',      fee: 400, estimatedDays: '2-3' },
  { district: 'Matara',        province: 'Southern',      fee: 350, estimatedDays: '2-3' },
  { district: 'Jaffna',        province: 'Northern',      fee: 550, estimatedDays: '3-5' },
  { district: 'Kilinochchi',   province: 'Northern',      fee: 600, estimatedDays: '3-5' },
  { district: 'Mannar',        province: 'Northern',      fee: 600, estimatedDays: '3-5' },
  { district: 'Mullaitivu',    province: 'Northern',      fee: 600, estimatedDays: '3-5' },
  { district: 'Vavuniya',      province: 'Northern',      fee: 550, estimatedDays: '3-5' },
  { district: 'Ampara',        province: 'Eastern',       fee: 500, estimatedDays: '3-4' },
  { district: 'Batticaloa',    province: 'Eastern',       fee: 500, estimatedDays: '3-4' },
  { district: 'Trincomalee',   province: 'Eastern',       fee: 500, estimatedDays: '3-4' },
  { district: 'Kurunegala',    province: 'North Western', fee: 350, estimatedDays: '2-3' },
  { district: 'Puttalam',      province: 'North Western', fee: 400, estimatedDays: '2-3' },
  { district: 'Anuradhapura',  province: 'North Central', fee: 450, estimatedDays: '2-3' },
  { district: 'Polonnaruwa',   province: 'North Central', fee: 450, estimatedDays: '2-3' },
  { district: 'Badulla',       province: 'Uva',           fee: 450, estimatedDays: '2-3' },
  { district: 'Monaragala',    province: 'Uva',           fee: 500, estimatedDays: '3-4' },
  { district: 'Ratnapura',     province: 'Sabaragamuwa',  fee: 400, estimatedDays: '2-3' },
  { district: 'Kegalle',       province: 'Sabaragamuwa',  fee: 350, estimatedDays: '2-3' },
];

const CONTINENTS = [
  { continent: 'Asia',          fee: 15,  currency: 'USD', estimatedDays: '5-10',  countries: ['India','Pakistan','Bangladesh','Nepal','Bhutan','Maldives','China','Japan','South Korea','Singapore','Malaysia','Thailand','Vietnam','Indonesia','Philippines'] },
  { continent: 'Europe',        fee: 25,  currency: 'USD', estimatedDays: '7-14',  countries: ['UK','Germany','France','Italy','Spain','Netherlands','Sweden','Norway','Denmark','Belgium','Switzerland','Austria','Portugal','Ireland','Poland'] },
  { continent: 'North America', fee: 30,  currency: 'USD', estimatedDays: '10-14', countries: ['United States','Canada','Mexico'] },
  { continent: 'South America', fee: 35,  currency: 'USD', estimatedDays: '10-18', countries: ['Brazil','Argentina','Chile','Colombia','Peru','Venezuela','Ecuador'] },
  { continent: 'Africa',        fee: 30,  currency: 'USD', estimatedDays: '10-20', countries: ['South Africa','Nigeria','Kenya','Egypt','Ethiopia','Ghana','Tanzania'] },
  { continent: 'Australia',     fee: 28,  currency: 'USD', estimatedDays: '7-14',  countries: ['Australia','New Zealand','Papua New Guinea','Fiji'] },
  { continent: 'Antarctica',    fee: 999, currency: 'USD', estimatedDays: '∞',     countries: [] },
];

module.exports = { SRI_LANKA_DISTRICTS, CONTINENTS };
