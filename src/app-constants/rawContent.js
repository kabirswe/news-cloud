module.exports = {
  PUBLICATION: 'publication',
  REVIEW: 'review',
  APPROVAL: 'approval',
  STATUS: 'status',
  YOUTUBE: '1',
  VIMEO: '2',
  NEWSCLOUD: '0',
  PUBLICATION_STATUS_ICON: [
    {
      NAME: 'DEFAULT',
      COLOR: ''
    },
    {
      NAME: 'UNPUBLISHED',
      COLOR: '#8D8D8D',
      STATUS: "未公開"
    },
    {
      NAME: 'WAITING_FOR_RELEASE',
      COLOR: '#38D200',
      STATUS: "公開待ち"
    },
    {
      NAME: 'PUBLISHED',
      COLOR: '#03A11D',
      STATUS: "公開中"
    },
    {
      NAME: 'END_PUBLISH',
      COLOR: '#E97F16',
      STATUS: "公開終了"
    },
    {
      NAME: 'PROHIBITION',
      COLOR: '#E00061',
      STATUS: "公開禁止"
    }
  ],
  APPROVAL_STATUS: [
    {
      NAME: 'DEFAULT',
      COLOR: '#8D8D8D'
    },
    {
      NAME: 'EDITIING',
      COLOR: '#8D8D8D',
      STATUS: "編集中"
    },
    {
      NAME: 'UNDER_REVIEW',
      COLOR: '#26B1E4',
      STATUS: "レビュー依頼中"
    },
    {
      NAME: 'REVIEW_OK',
      COLOR: '#26B1E4',
      STATUS: "レビューOK"
    },
    {
      NAME: 'REVIEW_NG',
      COLOR: '#26B1E4',
      STATUS: "レビューNG"
    },
    {
      NAME: 'REQUESTING_APPROVAL',
      COLOR: '#8AC616',
      STATUS: "承認依頼中"
    },
    {
      NAME: 'APPROVAL_OK',
      COLOR: '#8AC616',
      STATUS: "承認OK"
    },
    {
      NAME: 'APPROVAL_NG',
      COLOR: '#8AC616',
      STATUS: "承認NG"
    }
  ],
  RAW_VIDEO_STATUS: [
    {
      id: 1,
      name: 'アップロード無し',
      isChecked: false,
      value: 0,
      param: 'notUploaded'
    },
    {
      id: 2,
      name: 'アップロード済み',
      isChecked: false,
      value: 1,
      param: 'uploaded'
    },
    {id: 3, name: '非公開', isChecked: false, value: 0, param: 'notPublished'},
    {
      id: 4,
      name: '公開待ち',
      isChecked: false,
      value: 2,
      param: 'waitingPublish'
    },
    {id: 5, name: '公開中', isChecked: false, value: 1, param: 'published'}
  ],
  VIDEO_DESTINATION: [
    {id: 1, name: '無し', isChecked: false, value: 0, param: 'destinationNone'},
    {
      id: 2,
      name: 'YouTube',
      isChecked: false,
      value: 1,
      param: 'destinationYoutube'
    },
    {id: 3, name: 'Vimeo', isChecked: false, value: 2, param: 'destinationVimeo'}
  ],
  ARTICLE_STATUS: [
    {
      id: 1,
      name: '鈴木太郎',
      isChecked: false,
      value: 0,
      param: 'notUploaded'
    },
    {
      id: 2,
      name: '鈴木一郎',
      isChecked: false,
      value: 1,
      param: 'uploaded'
    },
    {id: 3, name: '鈴木二郎', isChecked: false, value: 0, param: 'notPublished'},
    {
      id: 4,
      name: '鈴木二郎',
      isChecked: false,
      value: 2,
      param: 'waitingPublish'
    },
    {id: 5, name: '鈴木三郎', isChecked: false, value: 1, param: 'published'},
    {id: 6, name: '鈴木五郎', isChecked: false, value: 1, param: 'published'},
    {id: 7, name: '鈴木六郎', isChecked: false, value: 1, param: 'published'},
    {id: 8, name: '鈴木七郎', isChecked: false, value: 1, param: 'published'}
  ],
  ARTICLE_DESTINATION: [
    {id: 1, name: '鈴木太郎', isChecked: false, value: 0, param: 'destinationNone'}
  ]
};