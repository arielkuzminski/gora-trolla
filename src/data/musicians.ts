export type Lang = 'pl' | 'en';

export interface Musician {
  name: string;
  instruments: string;
  bio: Record<Lang, string>;
  image?: string;
  imagePosition?: string;
  sameAs: string[];
}

export const musicians: Musician[] = [
  {
    name: 'Ariel',
    instruments: 'Dudy, szałamaje, flety',
    bio: {
      pl: 'Założyciel i lider Góry Trolla. Pasjonat piszczałek wszystkich epok - od średniowiecznych szałamai po dudy różnych tradycji europejskich. Dmucha, gra i zarządza.',
      en: 'Founder and leader of Góra Trolla. A devotee of wind instruments from every era, from medieval shawms to bagpipes of many European traditions. He blows, plays, and keeps the whole ensemble together.'
    },
    image: '/media/dudy4.jpg',
    imagePosition: 'center 30%',
    sameAs: [
      'https://www.facebook.com/goratrolla',
      'https://www.instagram.com/goratrolla',
      'https://www.youtube.com/watch?v=OgWUrgaBPnU'
    ]
  },
  {
    name: 'Maciej',
    instruments: 'Wodzirej',
    bio: {
      pl: 'Bez Maćka żaden koncert nie byłby tym samym. Jako wodzirej rozgrzewa tłumy, prowadzi tańce i sprawia, że publiczność - chcąc nie chcąc - bawi się doskonale.',
      en: 'Without Maciej, no concert would feel the same. As master of ceremonies he warms up the crowd, leads the dances, and makes sure the audience has a thoroughly good time.'
    },
    image: '/media/maciek.JPG',
    sameAs: [
      'https://www.facebook.com/goratrolla',
      'https://www.instagram.com/goratrolla',
      'https://www.youtube.com/watch?v=OgWUrgaBPnU'
    ]
  },
  {
    name: 'Rafał',
    instruments: 'Buzuki irlandzkie, flety',
    bio: {
      pl: 'Mistrz strun szarpanych z celtycką duszą. Jego buzuki irlandzkie nadaje brzmieniu zespołu wyjątkowy, hipnotyczny klimat. W wolnych chwilach dmucha w flety.',
      en: 'A master of plucked strings with a Celtic soul. His Irish bouzouki gives the ensemble a distinctive, hypnotic texture. In quieter moments, he also reaches for flutes.'
    },
    image: '/media/rafal.JPG',
    sameAs: [
      'https://www.facebook.com/goratrolla',
      'https://www.instagram.com/goratrolla',
      'https://www.youtube.com/watch?v=OgWUrgaBPnU'
    ]
  },
  {
    name: 'Jędrzej',
    instruments: 'Davul',
    bio: {
      pl: 'Serce i puls Góry Trolla. Davul - wielki bęben osmańskiej proweniencji - w jego rękach zamienia każdy plac w pole bitwy lub salę balową. Gra tak głośno, że słychać go przez ściany.',
      en: 'The heart and pulse of Góra Trolla. In his hands, the davul, a great Ottoman drum, can turn any square into a battlefield or a ballroom. He plays loudly enough to carry through walls.'
    },
    image: '/media/jedrzej.JPG',
    sameAs: [
      'https://www.facebook.com/goratrolla',
      'https://www.instagram.com/goratrolla',
      'https://www.youtube.com/watch?v=OgWUrgaBPnU'
    ]
  },
  {
    name: 'Krzysztof',
    instruments: 'Mandola',
    bio: {
      pl: 'Człowiek czterech strun i niezliczonej cierpliwości. Na mandoli wydobywa zarówno delikatne tremolo renesansowych ballad, jak i rwące rytmy muzyki ulicznej.',
      en: 'A man of four strings and inexhaustible patience. On the mandola he can summon both the delicate tremolo of Renaissance ballads and the driving pulse of street music.'
    },
    image: '/media/krzysztof.JPG',
    sameAs: [
      'https://www.facebook.com/goratrolla',
      'https://www.instagram.com/goratrolla',
      'https://www.youtube.com/watch?v=OgWUrgaBPnU'
    ]
  },
  {
    name: 'Jasio',
    instruments: 'Człowiek orkiestra',
    bio: {
      pl: 'Fenomen natury. Jasio gra na wszystkim, czego akurat nikt inny nie gra - i robi to lepiej. Jego talenty muzyczne wymykają się wszelkiej klasyfikacji. Legenda.',
      en: 'A force of nature. Jasio plays whatever nobody else is playing at the moment, and somehow does it better. His musical gifts defy classification. A legend.'
    },
    image: '/media/jasio.png',
    sameAs: [
      'https://www.facebook.com/goratrolla',
      'https://www.instagram.com/goratrolla',
      'https://www.youtube.com/watch?v=OgWUrgaBPnU'
    ]
  }
];
