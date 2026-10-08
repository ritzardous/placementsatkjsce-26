// Run manually to refresh the bundled website icons; never needed at runtime.
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const brands = [
  ['google', 'google.com', ['google']],
  ['barclays', 'home.barclays', ['barclays']],
  ['jpmorgan', 'jpmorganchase.com', ['jpmc', 'jp-morgan-chase-co']],
  ['goldman-sachs', 'goldmansachs.com', ['goldman-sachs']],
  ['browserstack', 'browserstack.com', ['browserstack', 'browserstack-software-pvt-ltd']],
  ['capgemini', 'capgemini.com', ['capgemini']],
  ['deloitte', 'deloitte.com', ['deloitte-india']],
  ['ey', 'ey.com', ['ey']],
  ['kpmg', 'kpmg.com', ['kpmg']],
  ['oracle', 'oracle.com', ['oracle', 'oracle-financial-software-services-ltd']],
  ['amazon', 'amazon.in', ['amazon-india']],
  ['accenture', 'accenture.com', ['accenture']],
  ['cisco', 'cisco.com', ['cisco-systems-india-private-limited']],
  ['hsbc', 'hsbc.com', ['hsbc']],
  ['hdfc-life', 'hdfclife.com', ['hdfc-life']],
  ['icici-lombard', 'icicilombard.com', ['icici-lombard']],
  ['icici-prudential-life', 'iciciprulife.com', ['icici-prudential-life-insurance']],
  ['icici-prudential-amc', 'icicipruamc.com', ['icici-prudential-amc-ltd']],
  ['colgate', 'colgatepalmolive.com', ['colgate', 'colgate-palmolive']],
  ['godrej-capital', 'godrejcapital.com', ['godrej-capital']],
  ['godrej', 'godrejenterprises.com', ['godrej-and-boyce', 'godrej-boyce', 'godrej-and-boyce-ppo']],
  ['godrej-consumer', 'godrejcp.com', ['godrej-consumer-products-limited']],
  ['godrej-industries', 'godrejindustries.com', ['godrej-industries-limited']],
  ['mahindra', 'mahindra.com', ['mahindra-mahindra']],
  ['jsw', 'jsw.in', ['jsw']],
  ['tata-power', 'tatapower.com', ['tata-power']],
  ['tcs', 'tcs.com', ['tcs-ninja']],
  ['reliance', 'ril.com', ['reliance-industries-limited']],
  ['ltimindtree', 'ltimindtree.com', ['ltimindtree']],
  ['ltts', 'ltts.com', ['l-t-technology-services']],
  ['nouryon', 'nouryon.com', ['nouryon-chemicals', 'nouryon-chemicals-india-private-limited']],
  ['stonex', 'stonex.com', ['stonex']],
  ['ion', 'iongroup.com', ['ion', 'ion-group']],
  ['connectwise', 'connectwise.com', ['connectwise']],
  ['cimpress', 'cimpress.com', ['cimpress']],
  ['interactive-brokers', 'interactivebrokers.com', ['interactive-broker', 'interactive-brokers']],
  ['mondelez', 'mondelezinternational.com', ['mondelez-digital-services']],
  ['dp-world', 'dpworld.com', ['dp-world']],
  ['zs', 'zs.com', ['zs-associates']],
  ['rapid7', 'rapid7.com', ['rapid7']],
  ['crisil', 'crisil.com', ['crisil', 'crisil-intelligence']],
  ['ericsson', 'ericsson.com', ['ericsson-india']],
  ['sp-global', 'spglobal.com', ['s-p-global']],
  ['morningstar', 'morningstar.com', ['morning-star']],
  ['nagarro', 'nagarro.com', ['nagarro-software']],
  ['bluestar', 'bluestarindia.com', ['bluestar']],
  ['rbl', 'rbl.bank.in', ['rbl-bank']],
  ['sbi-general', 'sbigeneral.in', ['sbi-general-insurance']],
  ['holcim', 'holcim.com', ['holcim-global-digital-hub']],
  ['worley', 'worley.com', ['worley']],
  ['caratlane', 'caratlane.com', ['caratlane-a-tata-product']],
  ['purplle', 'purplle.com', ['purplle']],
  ['leadsquared', 'leadsquared.com', ['leadsquared']],
  ['citiustech', 'citiustech.com', ['citiustech']],
  ['edelweiss', 'edelweissfin.com', ['edelweiss-global-markets']],
  ['idfy', 'idfy.com', ['idfy']],
  ['idfc-first', 'idfcfirstbank.com', ['idfc-bank']],
  ['aci-worldwide', 'aciworldwide.com', ['aci-worldwide']],
  ['jaro', 'jaroeducation.com', ['jaro-education']],
  ['axis-amc', 'axismf.com', ['axis-asset-management-company-ltd']],
  ['nsdl', 'nsdl.com', ['national-securities-depository-ltd']],
  ['smfg', 'smfgindiacredit.com', ['smfg-india-credit']],
  ['bandhan-amc', 'bandhanmutual.com', ['bandhan-amc']],
  ['piramal-pharma', 'piramalpharma.com', ['piramal-pharma']],
  ['yotta', 'yotta.com', ['yotta-data-services']],
  ['nuvoco', 'nuvoco.com', ['nuvoco-vistas-corp-ltd']],
  ['aptia', 'aptia-group.com', ['aptia', 'aptia-india']],
  ['iks-health', 'ikshealth.com', ['iks']],
  ['mr-diy', 'mrdiy.co.in', ['mr-diy']],
  ['loylty', 'loylty.com', ['loylty-rewardz', 'loylty-rewardz-mngt-pvt-ltd']],
  ['aurionpro', 'aurionpro.com', ['aurion-pro']],
  ['accelya', 'accelya.com', ['accelya-group']],
  ['gupshup', 'gupshup.io', ['gupshup-technology']],
  ['hyperverge', 'hyperverge.co', ['hyperverge']],
  ['seclore', 'seclore.com', ['seclore']],
  ['ideaforge', 'ideaforgetech.com', ['ideaforge-technology-ltd']],
  ['investec', 'investec.com', ['investec-global-services-india-private-limited']],
  ['tresvista', 'tresvista.com', ['tresvista']],
  ['arcon', 'arconnet.com', ['arcon']],
  ['dolat', 'dolatcapital.com', ['dolat-capital']],
  ['cityflo', 'cityflo.com', ['cityflo']],
  ['paynearby', 'paynearby.in', ['pay-nearby']],
  ['orange-business', 'orange-business.com', ['orange-business']],
  ['360-one', '360.one', ['360-one']],
  ['toyo', 'toyo-eng.com', ['toyo-engineering']],
  ['oberoi', 'oberoirealty.com', ['oberoi-realty']],
  ['framatome', 'framatome.com', ['framatome-pvt-ltd']],
  ['rsm', 'rsm.global', ['rsm-astute-consulting']],
  ['nilkamal', 'nilkamal.com', ['nilkamal']],
  ['sutherland', 'sutherlandglobal.com', ['sutherland']],
  ['trent', 'trentlimited.com', ['tata-trent']],
  ['rebit', 'rebit.org.in', ['reserve-bank-information-technology-pvt-ltd-rebit']],
  ['grindwell-norton', 'grindwellnorton.co.in', ['grindwell-norton-limited-saint-gobain-group']],
  ['mukand', 'mukand.com', ['mukand-ltd-bajaj-group']],
  ['sharekhan', 'sharekhan.com', ['sharekhan-limited']],
  ['mindgate', 'mindgate.solutions', ['mindgate-solutions-private-limited']],
  ['greylabs', 'greylabs.ai', ['greylabs-ai', 'greylabs-ai-ahg-technologies-private-limited']],
  ['impactguru', 'impactguru.com', ['impactguru', 'impact-guru-technology-venture']],
  ['intrade', 'intradets.com', ['intrade']],
  ['icici-prudential', 'iciciprulife.com', ['icici-prudential']],
  ['crackeddevs', 'crackeddevs.beehiiv.com', ['crackeddevs']],
  ['edelweiss-insurance', 'edelweissfin.com', ['edelweiss-insurance']],
  ['transbnk', 'tbx.co.in', ['transbnk-solutions']],
  ['think360', 'think360.ai', ['think-360']],
  ['smowcode', 'smowcode.com', ['smowcode-private-limited']],
  ['edra', 'www.linkedin.com/company/edra-labs', ['edra-labs', 'edra-labs-llp']],
];

// Prefer sharper official assets where the cached website icon is too small.
const directAssets = {
  edra: ['https://media.licdn.com/dms/image/v2/D4D0BAQFcSgfDbJsMEw/company-logo_400_400/company-logo_400_400/0/1737108000667/edra_labs_logo?e=1793232000&v=beta&t=vRZBAfoQfpKXmBRCwQo2H5sw-l3SUw1vZ3fUZguTQRw', 'jpg'],
  jpmorgan: ['https://www.jpmorganchase.com/content/dam/jpmorganchase/images/logos/jpmc-logo.svg', 'svg'],
  intrade: ['https://www.intradets.com/Logo.svg', 'svg'],
  loylty: ['https://loylty.com/logo.png', 'png'],
  'edelweiss-insurance': ['https://www.edelweissfin.com/wp-content/uploads/2020/02/logo-1.png', 'png'],
  crackeddevs: ['https://media.beehiiv.com/uploads/publication/logo/c7cb70a5-017a-48c0-8089-18ba0c1c5204/ccc.png', 'png'],
  transbnk: ['https://www.tbx.co.in/logo-new.webp', 'webp'],
  think360: ['https://think360.ai/wp-content/uploads/2023/06/Think-new-logo1.png', 'png'],
  smowcode: ['https://smowcode.com/images/logo/smowcode-text-logo-low-res-reg.png', 'png'],
  nsdl: ['https://www.google.com/s2/favicons?domain_url=https://nsdl.com&sz=128', 'png'],
  nilkamal: ['https://nilkamal.com/wp-content/themes/binary-theme/images/Nilkamal_logo_new.jpg', 'jpg'],
  greylabs: ['https://greylabs.ai/favicon-96x96.png', 'png'],
  impactguru: ['https://cdn.impactguru.com/themes/front/page/images/icons/impactguru.png', 'png'],
  smfg: ['https://assets.smfgindiacredit.com/static/images/SMFG-Logo.svg', 'svg'],
  trent: ['https://trentlimited.com/cdn/shop/files/TRENT_LOGO_1_180x.png?v=1723527862', 'png'],
  toyo: ['https://www.toyo-eng.com/common/img/favicon.ico', 'ico'],
  browserstack: ['https://bstackprod.kinsta.cloud/wp-content/themes/browserstack/img/favicons/apple-touch-icon.png', 'png'],
  kpmg: ['https://kpmg.com/content/experience-fragments/kpmgpublic/xx/en/site/header/master/_jcr_content/root/header_v2/logo.coreimg.svg/1787056531657/logo.svg', 'svg'],
  ltts: ['https://www.ltts.com/themes/custom/ltts_revamp/logo.svg', 'svg'],
  reliance: ['https://rilstaticasset.akamaized.net/sites/default/files/2022-11/reliance-industries-ltd.png', 'png'],
  'sbi-general': ['https://www.sbigeneral.in/assets/images/sbig-logo.webp', 'webp'],
  ltimindtree: ['https://www.ltm.com/refresh-images/icons/LTM_favicon.png', 'png'],
  purplle: ['https://media6.ppl-media.com/mediafiles/ecomm/promo/1728010487_p-icon-square-appfirst-.svg', 'svg'],
  crisil: ['https://www.crisil.com/content/dam/crisil/crisil-homepage-logo/32-x-32.png', 'png'],
  worley: ['https://www.worley.com/-/media/images/worley/logos/global/header-logo-updated.png', 'png'],
};

// Give white wordmarks contrast; tile dimensions are uniform for every company.
const presentation = {
  reliance: { background: '#12243a' },
  loylty: { background: '#14375d' },
  worley: { background: '#153c42' },
  'edelweiss-insurance': { background: '#123357' },
};

await mkdir('public/company-logos', { recursive: true });
// Keep verified assets if a refresh fails; --missing adds only unmapped brands.
const previous = JSON.parse(await readFile('src/company-logos.json', 'utf8').catch(() => '[]'));
const entries = [...previous];
const only = process.argv.find(arg => arg.startsWith('--only='))?.slice(7).split(',');
const selected = only ? brands.filter(([id]) => only.includes(id)) : process.argv.includes('--missing') ? brands.filter(([id]) => !previous.some(entry => entry.id === id)) : brands;
for (let start = 0; start < selected.length; start += 6) {
  await Promise.all(selected.slice(start, start + 6).map(async ([id, domain, aliases]) => {
    const [source, expectedExtension] = directAssets[id] ?? [`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(`https://${domain}`)}&sz=128`, 'png'];
    try {
      const response = await fetch(source, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const extension = !directAssets[id] && bytes.subarray(0, 3).toString('hex') === 'ffd8ff' ? 'jpg' : expectedExtension;
      if (extension === 'png' && bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Not PNG');
      if (extension === 'jpg' && bytes.subarray(0, 3).toString('hex') !== 'ffd8ff') throw new Error('Not JPEG');
      if (extension === 'webp' && bytes.subarray(8, 12).toString() !== 'WEBP') throw new Error('Not WebP');
      if (extension === 'ico' && bytes.subarray(0, 4).toString('hex') !== '00000100') throw new Error('Not ICO');
      if (extension === 'svg' && (!bytes.toString().includes('<svg') || /<script|<foreignObject|\bon\w+\s*=|(?:href|xlink:href)\s*=\s*["'](?:https?:|\/\/|data:|javascript:)/i.test(bytes.toString()))) throw new Error('Unsafe or invalid SVG');
      const file = `/company-logos/${id}.${extension}`;
      await writeFile(`public${file}`, bytes);
      const oldIndex = entries.findIndex(entry => entry.id === id);
      if (oldIndex !== -1) entries.splice(oldIndex, 1);
      entries.push({ id, aliases, file, website: `https://${domain}`, source, ...presentation[id] });
      console.log(`${id}: ${extension}`);
    } catch (error) { console.log(`${id}: skipped (${error.message})`); }
  }));
}
entries.sort((a, b) => a.id.localeCompare(b.id));
await writeFile('src/company-logos.json', JSON.stringify(entries, null, 2) + '\n');
console.log(`Saved ${entries.length} brand icons.`);
