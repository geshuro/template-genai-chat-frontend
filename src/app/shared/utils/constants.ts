export abstract class Constants {
  static readonly unPinnedList = [
    {
      icon: 'push_pin',
      title: 'PING_CHAT',
      action: 'pingHistory',
    },
  ];

  static readonly pinnedList = [
    {
      icon: 'arrow_downward',
      title: 'UN_PING_CHAT',
      action: 'pingHistory',
    },
  ];

  static readonly listCommon = [
    {
      icon: 'edit',
      title: 'EDIT_CHAT',
      action: 'editNameHistory',
    },
    {
      icon: 'download',
      title: 'EXPORT_CHAT',
      action: 'exportHistory',
    },
    {
      icon: 'edit',
      title: 'EDIT_EMOJI',
      action: 'editIconHistory',
    },
    {
      icon: 'delete',
      title: 'DELETE_CHAT',
      action: 'deleteHistory',
    },
  ];

  static readonly customEmojiRRHH = [
    {
      name: 'RRHH',
      shortNames: ['RRHH'],
      text: '',
      emoticons: [],
      keywords: ['RRHH'],
      imageUrl: 'assets/icons/icons-rh+/icon-512x512.png',
    },
  ];

  static readonly customEmojiServiceDesk = [
    {
      name: 'Service Desk',
      shortNames: ['SDLOGO'],
      text: '',
      emoticons: [],
      keywords: ['RRHH'],
      imageUrl: 'assets/icons/sd_logo.png',
    },
  ];

  static readonly customEmojiGeneral = [
    {
      name: 'General',
      shortNames: ['general'],
      text: '',
      emoticons: [],
      keywords: ['general'],
      imageUrl: 'assets/icons/copilot_logo.png',
    },
  ];

  static readonly ALL_ROLES = [
    'chat_metatron_user_basic',
    'chat_metatron_user_pro',
    'chat_metatron_user_admin',
    'chat_metatron_airport_agent',
    'chat_metatron_legal_leasing',
    'chat_metatron_aircraft_technician',
    'chat_metatron_user_airtalk',
  ];

  static readonly UNKNOWN_QUERY_CATEGORY = 'Fuera de alcance';

  static readonly GENERAL_KNOWLEDGEBASE_LABEL = 'Búsqueda General';

  static readonly API_FEEDBACK = '/chat/feedback?ngsw-bypass=true';

  static readonly API_SIGNED_URL = '/storage/signed-url';

  static readonly API_ISSUES = '/issues?ngsw-bypass=true';

  static readonly API_INTERACTIONS_POPULAR = '/interactions/popular';

  static readonly API_MODELS = '/models';

  static readonly API_FILES = '/files?ngsw-bypass=true';

  static readonly API_EMBEDDINGS = '/embeddings?ngsw-bypass=true';

  static readonly API_IMAGES_GENERATE = '/images/generate';

  static readonly API_IMAGES_DESCRIBE = '/images/describe';

  static readonly API_BYPASS_CACHE = '?ngsw-bypass=true';

  static readonly API_TOKEN_USER_ZENDESK = '/user/token';

  static readonly HTTP_CODES_NOT_RETRY = [0, 400, 401, 413, 403, 404, 500];
}
