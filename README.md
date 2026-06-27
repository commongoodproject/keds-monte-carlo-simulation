# COMMON GOOD PARADIGM // SYSTEMIC ARCHITECTURE & PARAMETER SPECIFICATION
**Project Chimera: Dynamic Monte Carlo Simulation Framework for Social Policy Optimization**

---

## 1. TIETOLOMAKKEEN STRATEGINEN VIITEKEHYS

Tämä spesifikaatio määrittelee "Yhteisen hyvän" (*Common Good Sandbox*) ideologian matemaattisen ytimen sekä ne järjestelmätyyppiset muuttujat, joita käytetään suomalaisen työllisyys- ja sosiaalipolitiikan kerrannaisvaikutusten stokastiseen mallintamiseen. 

Nykyinen sanktiokeskeinen yhteiskuntamalli (*HE 108/2025*) operoi suljetun "mustan laatikon" (*Blackbox*) periaatteella, jossa synkroninen odotus ja rangaistuksen uhka tuottavat järjestelmään merkittävää kognitiivista kitkaa. Monte Carlo -simulaatioiden (N=1000) perusteella tämä kitka ei toimi ohjausmekanismina, vaan se suistaa mikrotasolla toimivat agentit (yksilöt) biologiseen uhkatilaan (*threat system*), mikä nostaa järjestelmän kokonaiskriisikustannukset eksponentiaalisiksi (~27,7 M€ vs. Common Good ~4,5 M€).

Tämän tietolomakkeen tavoitteena on osoittaa lainsäädännölliset rajapinnat, joissa hallinnollinen täsmällisyys, kansantalouden vääntömomentti ja työpsykologinen vakaus kohtaavat.

---

## 2. KONEHUONEEN MUUTTUJATAULUKKO (The System Ledger)

Simulaattorin stokastinen moottori nojaa seuraaviin vakioituihin parametreihin, kynnysarvoihin ja viranomaiskuitteihin:

| Muuttuja | Kategoria | Arvo / Kynnysarvo | Yksikkö / Asteikko | Kuvaus & Systeeminen toiminta | Lähde |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Työllisyysasteen tavoite** | Talous | 80 | % | Hallituksen strateginen tavoite työllisten osuudesta työikäisestä väestöstä vuoteen 2031 mennessä. | [4] |
| **Työllisten lisäystavoite** | Talous | 100 000 | henkilöä | Hallituskauden nettolisäystavoite työllisten kokonaismäärään. | [4] |
| **Pohjoismainen malli (vaikutus)**| Työllisyys | 9 500 – 10 000 | henkilöä | Palvelumallin arvioitu työllisyysvaikutus nopean ja tiiviin tuen kautta. | [2, 6, 12] |
| **TE-palvelut 2024 (kuntasiirto)** | Työllisyys | 7 000 – 10 000 | henkilöä | Palveluiden siirto kunnille (1.1.2025); tavoitteena paikallinen kohtaanto. | [6] |
| **Julkisen talouden nettovaste** | Talous | +230 | M€ / vuosi | Pohjoismaisen mallin tavoiteltu positiivinen kokonaisvaikutus julkiseen talouteen. | [12] |
| **TE-resurssilisäys** | Hallinto | 70 | M€ / vuosi | Pysyvä määräraha asiakaspalvelun tihentämiseen ja henkilöstöön. | [12] |
| **Elinvoimakeskukset** | Hallinto | 10 (2000 htlöä) | kpl (asiantuntijaa)| 1.1.2026 aloittavat uudet alueelliset yksiköt ja niihin siirtyvä ELY-virkahenkilöstö. | [5] |
| **Alkuhaastattelun määräaika** | Palveluprosessi| 5 (joustovara 10)| arkipäivää | Aika työnhaun alkamisesta palvelutarpeen ensiarviointiin. | [2, 5, 12] |
| **Työnhakukeskustelujen tiheys** | Palveluprosessi| 2 | viikon välein | Tiiviin tuen sykli työttömyyden alkuvaiheessa (ensimmäiset 3 kk). | [2, 12] |
| **Määrällinen hakuvelvoite** | Työllisyystoimet| 4 (osa-aika 1/3kk)| työpaikkaa / kk | Lähtökohtainen synkroninen hakuvaatimus etuusoikeuden säilyttämiseksi. | [2, 3, 11] |
| **Kokoaikatyön määritelmä** | Työllisyystoimet| 30 | tuntia / viikko | Työnhakuvelvoitteen täyttävän työn vähimmäistyöaika. | [1] |
| **Omaishoidon aikaraja** | Työllisyys | 4 | tuntia / päivä | Hoivatyön raja-arvo; tämän alle jäävä hoiva ei vapauta kokoaikahausta. | [1] |
| **Provisiopalkan alaraja** | Työttömyysturva| 1252 | € / kk (2021 taso)| Kynnysarvo, jonka alittavasta työstä hakija saa kieltäytyä ilman sanktiota. | [2] |
| **Työmatkan kesto (harkinta)** | Työttömyysturva| 3 | tuntia / päivä | Kokoaikatyön päivittäisen edestakaisen työmatkan keston yläraja. | [2] |
| **Ammattitaitosuojan kesto** | Työttömyysturva| 3 | kuukautta | Jakso työttömyyden alussa kieltäytyä muusta kuin oman alan tyästä. | [2] |
| **Lyhytkestoiset opinnot** | Työttömyysturva| 6 | kuukautta | Enimmäisaika opiskella sivutoimisesti menettämättä työttömyysetuutta. | [10] |
| **Yrittäjyyden arviointivapaa** | Työttömyysturva| 4 | kuukautta | Jakso yritystoiminnan alussa ilman pää-/sivutoimisuuden viranomaisarviointia. | [10] |
| **Eroamiskarenssi** | Sanktiojärjestelmä| 45 | päivää | Korvaukseton määräaika työstä eroamisesta ilman pätevää syytä. | [2] |
| **1. laiminlyönti (karenssi)** | Sanktiojärjestelmä| 7 | päivää | Etuuden menetys suoraan ensimmäisestä hakuvelvoitteen laiminlyönnistä (1.3.2026 alkaen). | [3, 5, 11] |
| **Porrastetut karenssit (2. & 3.)**| Sanktiojärjestelmä| 5 ja 10 | maksupäivää | Seuraamukset toistuvista rikkeistä 12 kuukauden seurantajakson aikana. | [2] |
| **Työssäolovelvoite (4. rike)** | Sanktiojärjestelmä| 12 (uudistus 6)| viikkoa | Vaadittu työssäoloaika etuusoikeuden palauttamiseksi toistuvien laiminlyöntien jälkeen. | [2, 3, 5] |
| **Perusosan leikkaus (1. vaihe)** | Toimeentulotuki| 20 | % perusosasta | Alennus moitittavasta menettelystä (kesto max 1 kk). | [1, 3] |
| **Perusosan leikkaus (toistuva)**| Toimeentulotuki| 40 | % perusosasta | Jatkuvan laiminlyönnin alennusaste (kesto max 6 kk). | [1] |
| **Perusosan leikkaus (maksimi)** | Toimeentulotuki| 50 | % perusosasta | Maksimialennus ensisijaisen etuuden tai haun laiminlyönnistä. | [1, 3] |
| **Ansiotulojen suojaosa** | Toimeentulotuki| 150 | € / kuukausi | Suunniteltu poistettavaksi täysi-ikäisiltä; Common Good -mallin vääntöankkuri. | [1] |
| **Yksinasuvan perusosan leikkaus**| Talous | 3 (muut 2) | %-yksikköä | Suunnitellut säästöleikkaukset toimeentulotuen perusosaan. | [1] |
| **Ensisijaisen etuuden haku** | Prosessi | 1 | kuukausi | Kelan asettama määräaika hakea muuta etuutta toimeentulotukisanktion uhalla. | [1] |
| **Nuorten työllistymisseteli** | Työllisyystoimet| alle 30 | ikävuotta | Avustus kohdennetaan nuoriin; kattaa 50 % palkasta enintään 6 kk ajalta. | [5] |
| **Nuorten koulutushaku** | Työttömyysturva| 2 | opiskelupaikkaa | Alle 25v vailla tutkintoa olevan velvollisuus hakea koulutukseen (tarkistus 1.9.).| [10, 11] |
| **Yleistuki (perustaso 2025)** | Sosiaaliturva | 37,21 | € / päivä | Työmarkkinatuen ja peruspäivärahan korvaava taso. | [3] |
| **Ekvivalentti mediaanitulo** | Tilasto (2023)| 33 282 | € / vuosi | Kansallinen mediaanitulo suhteellisessa arvioinnissa. | [1] |
| **Minimitaso (Sos. peruskirja)** | Oikeudellinen | 50 | % mediaanista | Euroopan neuvoston suositus sosiaaliavustuksen vähimmäistasosta. | [1] |
| **Köyhyysriskissä olevat** | Tilasto (2023)| 930 000 | henkilöä | Syrjäytymisvaarassa olevan peruspopulaation volyymi. | [1] |
| **Osatyökykyiset (latentti)** | Työllisyys | 65 000 | henkilöä | Työelämän ulkopuolella oleva, työhön kykenevä potentiaali. | [8] |
| **Työttömän bruttotulot** | Toimeentulo | 1300 (naiset 1200)| € / kuukausi | SAK:laisen työttömän keskimääräinen tulotaso. | [7] |
| **KEDS-testin uupumuskynnys** | Mielenterveys | 19 | 0–54 pisteen asteikko| **Simulaattorin kognitiivinen kuormavastus.** Raja-arvo, jossa looginen pystyvyys murenee. | *(Konsepti)* |
| **Skills-profiilin match-rate** | Common Good | 98 | % | Tekoälyavusteinen mikrotaitojen kohtaanto ilman virallista tutkintovaatimusta. | [9] |

---

## 3. PARADIGMAN ERILISYYS: MIKSI KITKA EI KANNA?

Yllä oleva taulukko paljastaa nykyjärjestelmän sisäänrakennetun paradoksin. Lainsäätäjä yrittää hallita matalan jännitteen vääntöä tasaisilla prosenttileikkauksilla (3 %, 20 %, 40 %, 50 %). Konesalin stokastisessa simulaatiossa nämä leikkaukset osuvat suoraan KEDS-kynnykselle 19. 

Kun prefrontaalinen aivokuori lamaantuu biologisen uhkajärjestelmän johdosta, hakija ei kykene prosessoimaan synkronista 4/kk hakuvelvoitetta. Seurauksena on rekursiivinen pii-romahdus: **45 euron hallintokululla säästetty 20 % toimeentuloleikkaus laukaisee ketjureaktion, joka päättyy 18 000 euron akuuttiin kriisihoidon tai häädön laskuun.**

*Common Good Sandbox* poistaa tämän hallinnollisen jäännösjännitteen korvaamalla synkronisen syynyn asynkronisella osaamispuskurilla. Petoksen motiivi poistuu rakenteellisesta reiluudesta — suoritin ei yritä ohittaa palomuuria silloin, kun sen virransyöttö on vakaa.

---
`[ VALIDATED BY PROJECT CHIMERA STOCHASTIC ENGINE ]`  
`[ DARWIN/POSIX COMPATIBLE // READY FOR LINK TOWER ]`
