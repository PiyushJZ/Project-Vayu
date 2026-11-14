/**
 * Sample tables: real readings from three Bhopal CPCB stations (MPPCB), taken from the OpenAQ API on 14 Nov 2026.
 * Values are as OpenAQ reports them: hourly means for A to D, daily means for E. An empty cell is an hour or day
 * with no reading.
 */

export interface Sample {
  id: string;
  /** Stored on the brief and shown as its heading, so it names the place and the dates. */
  label: string;
  /** The date interval the readings cover, shown in the sample picker. */
  period: string;
  /** What the table holds and what stands out in it. */
  description: string;
  text: string;
}

const A = `Station,From Date (IST),PM2.5 (µg/m³),PM10 (µg/m³)
"T T Nagar, Bhopal - MPPCB",2026-11-03 00:00,90,272
"T T Nagar, Bhopal - MPPCB",2026-11-03 01:00,107,292
"T T Nagar, Bhopal - MPPCB",2026-11-03 02:00,114,264
"T T Nagar, Bhopal - MPPCB",2026-11-03 03:00,94,174
"T T Nagar, Bhopal - MPPCB",2026-11-03 04:00,78.5,122
"T T Nagar, Bhopal - MPPCB",2026-11-03 05:00,73.5,137
"T T Nagar, Bhopal - MPPCB",2026-11-03 06:00,71,134
"T T Nagar, Bhopal - MPPCB",2026-11-03 07:00,69,126
"T T Nagar, Bhopal - MPPCB",2026-11-03 08:00,64.5,133
"T T Nagar, Bhopal - MPPCB",2026-11-03 09:00,58.5,110
"T T Nagar, Bhopal - MPPCB",2026-11-03 10:00,30,75
"T T Nagar, Bhopal - MPPCB",2026-11-03 11:00,33,69
"T T Nagar, Bhopal - MPPCB",2026-11-03 12:00,37.3,65.3
"T T Nagar, Bhopal - MPPCB",2026-11-03 13:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-03 14:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-03 15:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-03 16:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-03 17:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-03 18:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-03 19:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-03 20:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-03 21:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-03 22:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-03 23:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-04 00:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-04 01:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-04 02:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-04 03:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-04 04:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-04 05:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-04 06:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-04 07:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-04 08:00,84,136
"T T Nagar, Bhopal - MPPCB",2026-11-04 09:00,76,127
"T T Nagar, Bhopal - MPPCB",2026-11-04 10:00,65.5,115
"T T Nagar, Bhopal - MPPCB",2026-11-04 11:00,62.5,123
"T T Nagar, Bhopal - MPPCB",2026-11-04 12:00,59.5,117
"T T Nagar, Bhopal - MPPCB",2026-11-04 13:00,52.5,95
"T T Nagar, Bhopal - MPPCB",2026-11-04 14:00,49,89
"T T Nagar, Bhopal - MPPCB",2026-11-04 15:00,48,91
"T T Nagar, Bhopal - MPPCB",2026-11-04 16:00,47.5,88
"T T Nagar, Bhopal - MPPCB",2026-11-04 17:00,51,103
"T T Nagar, Bhopal - MPPCB",2026-11-04 18:00,61.5,140
"T T Nagar, Bhopal - MPPCB",2026-11-04 19:00,82,158
"T T Nagar, Bhopal - MPPCB",2026-11-04 20:00,86,153
"T T Nagar, Bhopal - MPPCB",2026-11-04 21:00,67.5,120
"T T Nagar, Bhopal - MPPCB",2026-11-04 22:00,63,113
"T T Nagar, Bhopal - MPPCB",2026-11-04 23:00,69,134
"T T Nagar, Bhopal - MPPCB",2026-11-05 00:00,142,309
"T T Nagar, Bhopal - MPPCB",2026-11-05 01:00,150,280
"T T Nagar, Bhopal - MPPCB",2026-11-05 02:00,147,243
"T T Nagar, Bhopal - MPPCB",2026-11-05 03:00,117,197
"T T Nagar, Bhopal - MPPCB",2026-11-05 04:00,91.5,143
"T T Nagar, Bhopal - MPPCB",2026-11-05 05:00,82,126
"T T Nagar, Bhopal - MPPCB",2026-11-05 06:00,63.5,99
"T T Nagar, Bhopal - MPPCB",2026-11-05 07:00,48.5,79
"T T Nagar, Bhopal - MPPCB",2026-11-05 08:00,60,96
"T T Nagar, Bhopal - MPPCB",2026-11-05 09:00,65,107
"T T Nagar, Bhopal - MPPCB",2026-11-05 10:00,58,108
"T T Nagar, Bhopal - MPPCB",2026-11-05 11:00,48.5,96
"T T Nagar, Bhopal - MPPCB",2026-11-05 12:00,40.5,82
"T T Nagar, Bhopal - MPPCB",2026-11-05 13:00,35,74
"T T Nagar, Bhopal - MPPCB",2026-11-05 14:00,30,76
"T T Nagar, Bhopal - MPPCB",2026-11-05 15:00,50,117
"T T Nagar, Bhopal - MPPCB",2026-11-05 16:00,43,120
"T T Nagar, Bhopal - MPPCB",2026-11-05 17:00,43,103
"T T Nagar, Bhopal - MPPCB",2026-11-05 18:00,56,125
"T T Nagar, Bhopal - MPPCB",2026-11-05 19:00,63.5,144
"T T Nagar, Bhopal - MPPCB",2026-11-05 20:00,72,168
"T T Nagar, Bhopal - MPPCB",2026-11-05 21:00,86.5,181
"T T Nagar, Bhopal - MPPCB",2026-11-05 22:00,99,205
"T T Nagar, Bhopal - MPPCB",2026-11-05 23:00,104,230
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 00:00,126,232
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 01:00,119,238
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 02:00,116,237
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 03:00,104,168
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 04:00,78.8,111
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 05:00,69.3,103
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 06:00,71,107
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 07:00,75.3,133
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 08:00,75.5,147
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 09:00,65,130
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 10:00,39,82.5
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 11:00,35.8,77
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 12:00,41,77
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 13:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 14:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 15:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 16:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 17:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 18:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 19:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 20:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 21:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 22:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-03 23:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 00:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 01:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 02:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 03:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 04:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 05:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 06:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 07:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 08:00,109,215
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 09:00,86.3,170
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 10:00,78.5,144
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 11:00,70,124
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 12:00,64.3,113
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 13:00,54.5,99.5
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 14:00,50.5,102
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 15:00,49.3,111
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 16:00,43,102
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 17:00,57.8,138
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 18:00,94,255
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 19:00,131,331
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 20:00,164,303
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 21:00,203,337
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 22:00,220,359
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-04 23:00,204,315
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 00:00,176,294
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 01:00,169,304
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 02:00,157,299
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 03:00,153,257
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 04:00,121,204
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 05:00,102,156
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 06:00,97.8,155
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 07:00,111,163
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 08:00,125,201
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 09:00,92.3,171
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 10:00,62.3,152
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 11:00,51.5,116
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 12:00,53,84
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 13:00,35,85
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 14:00,34.5,86.3
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 15:00,34,94.8
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 16:00,39.8,119
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 17:00,54.5,177
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 18:00,108,302
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 19:00,196,400
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 20:00,158,387
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 21:00,186,407
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 22:00,220,380
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-05 23:00,231,364
"Idgah Hills, Bhopal - MPPCB",2026-11-03 00:00,62.5,146
"Idgah Hills, Bhopal - MPPCB",2026-11-03 01:00,77,158
"Idgah Hills, Bhopal - MPPCB",2026-11-03 02:00,43,108
"Idgah Hills, Bhopal - MPPCB",2026-11-03 03:00,47,127
"Idgah Hills, Bhopal - MPPCB",2026-11-03 04:00,46.3,116
"Idgah Hills, Bhopal - MPPCB",2026-11-03 05:00,45.3,109
"Idgah Hills, Bhopal - MPPCB",2026-11-03 06:00,50.8,118
"Idgah Hills, Bhopal - MPPCB",2026-11-03 07:00,54.3,124
"Idgah Hills, Bhopal - MPPCB",2026-11-03 08:00,47.8,119
"Idgah Hills, Bhopal - MPPCB",2026-11-03 09:00,44,114
"Idgah Hills, Bhopal - MPPCB",2026-11-03 10:00,32,83.5
"Idgah Hills, Bhopal - MPPCB",2026-11-03 11:00,28.5,72.8
"Idgah Hills, Bhopal - MPPCB",2026-11-03 12:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-03 13:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-03 14:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-03 15:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-03 16:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-03 17:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-03 18:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-03 19:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-03 20:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-03 21:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-03 22:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-03 23:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-04 00:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-04 01:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-04 02:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-04 03:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-04 04:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-04 05:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-04 06:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-04 07:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-04 08:00,60,156
"Idgah Hills, Bhopal - MPPCB",2026-11-04 09:00,57.5,152
"Idgah Hills, Bhopal - MPPCB",2026-11-04 10:00,50,133
"Idgah Hills, Bhopal - MPPCB",2026-11-04 11:00,,111
"Idgah Hills, Bhopal - MPPCB",2026-11-04 12:00,,92.8
"Idgah Hills, Bhopal - MPPCB",2026-11-04 13:00,,87.5
"Idgah Hills, Bhopal - MPPCB",2026-11-04 14:00,35,81
"Idgah Hills, Bhopal - MPPCB",2026-11-04 15:00,33.3,75
"Idgah Hills, Bhopal - MPPCB",2026-11-04 16:00,28,82.3
"Idgah Hills, Bhopal - MPPCB",2026-11-04 17:00,53,131
"Idgah Hills, Bhopal - MPPCB",2026-11-04 18:00,71.8,234
"Idgah Hills, Bhopal - MPPCB",2026-11-04 19:00,136,307
"Idgah Hills, Bhopal - MPPCB",2026-11-04 20:00,137,281
"Idgah Hills, Bhopal - MPPCB",2026-11-04 21:00,78,174
"Idgah Hills, Bhopal - MPPCB",2026-11-04 22:00,105,222
"Idgah Hills, Bhopal - MPPCB",2026-11-04 23:00,149,283
"Idgah Hills, Bhopal - MPPCB",2026-11-05 00:00,95.5,185
"Idgah Hills, Bhopal - MPPCB",2026-11-05 01:00,95,169
"Idgah Hills, Bhopal - MPPCB",2026-11-05 02:00,75.3,147
"Idgah Hills, Bhopal - MPPCB",2026-11-05 03:00,64.3,119
"Idgah Hills, Bhopal - MPPCB",2026-11-05 04:00,45,87.5
"Idgah Hills, Bhopal - MPPCB",2026-11-05 05:00,42.5,83.5
"Idgah Hills, Bhopal - MPPCB",2026-11-05 06:00,50,101
"Idgah Hills, Bhopal - MPPCB",2026-11-05 07:00,59.3,121
"Idgah Hills, Bhopal - MPPCB",2026-11-05 08:00,97.5,176
"Idgah Hills, Bhopal - MPPCB",2026-11-05 09:00,47.8,106
"Idgah Hills, Bhopal - MPPCB",2026-11-05 10:00,45.3,103
"Idgah Hills, Bhopal - MPPCB",2026-11-05 11:00,38.5,90
"Idgah Hills, Bhopal - MPPCB",2026-11-05 12:00,32.5,73.3
"Idgah Hills, Bhopal - MPPCB",2026-11-05 13:00,27.8,66.8
"Idgah Hills, Bhopal - MPPCB",2026-11-05 14:00,28.5,65.5
"Idgah Hills, Bhopal - MPPCB",2026-11-05 15:00,32.8,73.5
"Idgah Hills, Bhopal - MPPCB",2026-11-05 16:00,32.5,77.8
"Idgah Hills, Bhopal - MPPCB",2026-11-05 17:00,40,103
"Idgah Hills, Bhopal - MPPCB",2026-11-05 18:00,64,171
"Idgah Hills, Bhopal - MPPCB",2026-11-05 19:00,81.3,209
"Idgah Hills, Bhopal - MPPCB",2026-11-05 20:00,81,187
"Idgah Hills, Bhopal - MPPCB",2026-11-05 21:00,96,218
"Idgah Hills, Bhopal - MPPCB",2026-11-05 22:00,116,241
"Idgah Hills, Bhopal - MPPCB",2026-11-05 23:00,94,218`;

const B = `Station,From Date (IST),PM2.5 (µg/m³),PM10 (µg/m³)
"T T Nagar, Bhopal - MPPCB",2026-11-06 00:00,130,262
"T T Nagar, Bhopal - MPPCB",2026-11-06 01:00,119,232
"T T Nagar, Bhopal - MPPCB",2026-11-06 02:00,119,202
"T T Nagar, Bhopal - MPPCB",2026-11-06 03:00,132,197
"T T Nagar, Bhopal - MPPCB",2026-11-06 04:00,118,177
"T T Nagar, Bhopal - MPPCB",2026-11-06 05:00,98,164
"T T Nagar, Bhopal - MPPCB",2026-11-06 06:00,95,175
"T T Nagar, Bhopal - MPPCB",2026-11-06 07:00,96.5,171
"T T Nagar, Bhopal - MPPCB",2026-11-06 08:00,106,163
"T T Nagar, Bhopal - MPPCB",2026-11-06 09:00,116,170
"T T Nagar, Bhopal - MPPCB",2026-11-06 10:00,98.5,152
"T T Nagar, Bhopal - MPPCB",2026-11-06 11:00,66,129
"T T Nagar, Bhopal - MPPCB",2026-11-06 12:00,53,120
"T T Nagar, Bhopal - MPPCB",2026-11-06 13:00,54,115
"T T Nagar, Bhopal - MPPCB",2026-11-06 14:00,51,120
"T T Nagar, Bhopal - MPPCB",2026-11-06 15:00,49.3,110
"T T Nagar, Bhopal - MPPCB",2026-11-06 16:00,50,97.5
"T T Nagar, Bhopal - MPPCB",2026-11-06 17:00,54.5,114
"T T Nagar, Bhopal - MPPCB",2026-11-06 18:00,64,165
"T T Nagar, Bhopal - MPPCB",2026-11-06 19:00,92,263
"T T Nagar, Bhopal - MPPCB",2026-11-06 20:00,122,318
"T T Nagar, Bhopal - MPPCB",2026-11-06 21:00,137,318
"T T Nagar, Bhopal - MPPCB",2026-11-06 22:00,130,271
"T T Nagar, Bhopal - MPPCB",2026-11-06 23:00,114,220
"T T Nagar, Bhopal - MPPCB",2026-11-07 00:00,95,238
"T T Nagar, Bhopal - MPPCB",2026-11-07 01:00,94.5,231
"T T Nagar, Bhopal - MPPCB",2026-11-07 02:00,94.5,214
"T T Nagar, Bhopal - MPPCB",2026-11-07 03:00,103,220
"T T Nagar, Bhopal - MPPCB",2026-11-07 04:00,109,229
"T T Nagar, Bhopal - MPPCB",2026-11-07 05:00,99,198
"T T Nagar, Bhopal - MPPCB",2026-11-07 06:00,114,174
"T T Nagar, Bhopal - MPPCB",2026-11-07 07:00,102,154
"T T Nagar, Bhopal - MPPCB",2026-11-07 08:00,66,146
"T T Nagar, Bhopal - MPPCB",2026-11-07 09:00,61,131
"T T Nagar, Bhopal - MPPCB",2026-11-07 10:00,52,101
"T T Nagar, Bhopal - MPPCB",2026-11-07 11:00,42.5,98
"T T Nagar, Bhopal - MPPCB",2026-11-07 12:00,39.5,100
"T T Nagar, Bhopal - MPPCB",2026-11-07 13:00,39.5,103
"T T Nagar, Bhopal - MPPCB",2026-11-07 14:00,40.5,103
"T T Nagar, Bhopal - MPPCB",2026-11-07 15:00,40.5,104
"T T Nagar, Bhopal - MPPCB",2026-11-07 16:00,38.5,112
"T T Nagar, Bhopal - MPPCB",2026-11-07 17:00,44.5,142
"T T Nagar, Bhopal - MPPCB",2026-11-07 18:00,67.5,196
"T T Nagar, Bhopal - MPPCB",2026-11-07 19:00,88,223
"T T Nagar, Bhopal - MPPCB",2026-11-07 20:00,86.5,236
"T T Nagar, Bhopal - MPPCB",2026-11-07 21:00,87.5,252
"T T Nagar, Bhopal - MPPCB",2026-11-07 22:00,82,221
"T T Nagar, Bhopal - MPPCB",2026-11-07 23:00,72,191
"T T Nagar, Bhopal - MPPCB",2026-11-08 00:00,55,133
"T T Nagar, Bhopal - MPPCB",2026-11-08 01:00,76,171
"T T Nagar, Bhopal - MPPCB",2026-11-08 02:00,76.5,166
"T T Nagar, Bhopal - MPPCB",2026-11-08 03:00,51,125
"T T Nagar, Bhopal - MPPCB",2026-11-08 04:00,56,147
"T T Nagar, Bhopal - MPPCB",2026-11-08 05:00,70,145
"T T Nagar, Bhopal - MPPCB",2026-11-08 06:00,73,122
"T T Nagar, Bhopal - MPPCB",2026-11-08 07:00,82.5,162
"T T Nagar, Bhopal - MPPCB",2026-11-08 08:00,87,225
"T T Nagar, Bhopal - MPPCB",2026-11-08 09:00,64,178
"T T Nagar, Bhopal - MPPCB",2026-11-08 10:00,42.5,112
"T T Nagar, Bhopal - MPPCB",2026-11-08 11:00,36.5,107
"T T Nagar, Bhopal - MPPCB",2026-11-08 12:00,35,103
"T T Nagar, Bhopal - MPPCB",2026-11-08 13:00,32.5,103
"T T Nagar, Bhopal - MPPCB",2026-11-08 14:00,29.5,98
"T T Nagar, Bhopal - MPPCB",2026-11-08 15:00,30,94.5
"T T Nagar, Bhopal - MPPCB",2026-11-08 16:00,33,101
"T T Nagar, Bhopal - MPPCB",2026-11-08 17:00,38.5,114
"T T Nagar, Bhopal - MPPCB",2026-11-08 18:00,61,152
"T T Nagar, Bhopal - MPPCB",2026-11-08 19:00,93,236
"T T Nagar, Bhopal - MPPCB",2026-11-08 20:00,468,288
"T T Nagar, Bhopal - MPPCB",2026-11-08 21:00,710,864
"T T Nagar, Bhopal - MPPCB",2026-11-08 22:00,584,820
"T T Nagar, Bhopal - MPPCB",2026-11-08 23:00,577,775
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 00:00,245,381
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 01:00,271,383
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 02:00,222,336
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 03:00,158,221
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 04:00,134,182
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 05:00,123,171
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 06:00,129,171
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 07:00,152,206
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 08:00,183,259
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 09:00,192,303
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 10:00,168,292
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 11:00,107,204
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 12:00,58.3,128
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 13:00,46.8,111
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 14:00,43.5,105
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 15:00,39.8,117
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 16:00,54.3,155
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 17:00,72.8,256
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 18:00,112,338
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 19:00,169,346
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 20:00,229,392
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 21:00,250,390
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 22:00,258,421
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-06 23:00,279,504
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 00:00,254,361
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 01:00,230,324
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 02:00,210,294
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 03:00,180,251
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 04:00,144,204
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 05:00,123,181
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 06:00,110,158
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 07:00,105,155
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 08:00,106,165
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 09:00,97.8,168
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 10:00,50.5,123
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 11:00,43.8,107
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 12:00,37,100
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 13:00,34.8,92.8
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 14:00,28.5,89.3
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 15:00,30,94
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 16:00,29.8,82
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 17:00,37.3,106
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 18:00,72.5,163
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 19:00,134,248
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 20:00,230,383
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 21:00,242,392
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 22:00,218,341
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-07 23:00,195,310
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 00:00,190,303
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 01:00,172,294
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 02:00,144,239
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 03:00,123,207
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 04:00,102,176
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 05:00,100,183
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 06:00,98.5,163
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 07:00,90.8,153
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 08:00,87.5,150
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 09:00,72.8,134
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 10:00,47.8,97.3
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 11:00,37.8,89
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 12:00,36,91
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 13:00,31,90.5
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 14:00,24.5,71.5
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 15:00,23.5,74.8
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 16:00,27.5,90.3
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 17:00,45.8,145
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 18:00,100,234
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 19:00,184,302
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 20:00,260,392
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 21:00,390,536
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 22:00,657,785
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-08 23:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-06 00:00,93.5,190
"Idgah Hills, Bhopal - MPPCB",2026-11-06 01:00,80.5,164
"Idgah Hills, Bhopal - MPPCB",2026-11-06 02:00,81.8,162
"Idgah Hills, Bhopal - MPPCB",2026-11-06 03:00,85.5,167
"Idgah Hills, Bhopal - MPPCB",2026-11-06 04:00,73.8,153
"Idgah Hills, Bhopal - MPPCB",2026-11-06 05:00,78,146
"Idgah Hills, Bhopal - MPPCB",2026-11-06 06:00,70.3,130
"Idgah Hills, Bhopal - MPPCB",2026-11-06 07:00,68.3,146
"Idgah Hills, Bhopal - MPPCB",2026-11-06 08:00,105,218
"Idgah Hills, Bhopal - MPPCB",2026-11-06 09:00,93.8,196
"Idgah Hills, Bhopal - MPPCB",2026-11-06 10:00,61,118
"Idgah Hills, Bhopal - MPPCB",2026-11-06 11:00,51,109
"Idgah Hills, Bhopal - MPPCB",2026-11-06 12:00,39.3,96.3
"Idgah Hills, Bhopal - MPPCB",2026-11-06 13:00,38,89.3
"Idgah Hills, Bhopal - MPPCB",2026-11-06 14:00,32,82.5
"Idgah Hills, Bhopal - MPPCB",2026-11-06 15:00,37,86.8
"Idgah Hills, Bhopal - MPPCB",2026-11-06 16:00,49.3,113
"Idgah Hills, Bhopal - MPPCB",2026-11-06 17:00,52.3,139
"Idgah Hills, Bhopal - MPPCB",2026-11-06 18:00,85.3,219
"Idgah Hills, Bhopal - MPPCB",2026-11-06 19:00,91,234
"Idgah Hills, Bhopal - MPPCB",2026-11-06 20:00,119,235
"Idgah Hills, Bhopal - MPPCB",2026-11-06 21:00,126,257
"Idgah Hills, Bhopal - MPPCB",2026-11-06 22:00,110,237
"Idgah Hills, Bhopal - MPPCB",2026-11-06 23:00,102,202
"Idgah Hills, Bhopal - MPPCB",2026-11-07 00:00,75.5,157
"Idgah Hills, Bhopal - MPPCB",2026-11-07 01:00,59.3,129
"Idgah Hills, Bhopal - MPPCB",2026-11-07 02:00,73,146
"Idgah Hills, Bhopal - MPPCB",2026-11-07 03:00,89.5,154
"Idgah Hills, Bhopal - MPPCB",2026-11-07 04:00,71.8,142
"Idgah Hills, Bhopal - MPPCB",2026-11-07 05:00,62.5,132
"Idgah Hills, Bhopal - MPPCB",2026-11-07 06:00,72,140
"Idgah Hills, Bhopal - MPPCB",2026-11-07 07:00,68.3,135
"Idgah Hills, Bhopal - MPPCB",2026-11-07 08:00,62,143
"Idgah Hills, Bhopal - MPPCB",2026-11-07 09:00,47.3,114
"Idgah Hills, Bhopal - MPPCB",2026-11-07 10:00,38,93
"Idgah Hills, Bhopal - MPPCB",2026-11-07 11:00,33.8,81.3
"Idgah Hills, Bhopal - MPPCB",2026-11-07 12:00,30.5,72.3
"Idgah Hills, Bhopal - MPPCB",2026-11-07 13:00,31.5,71
"Idgah Hills, Bhopal - MPPCB",2026-11-07 14:00,29.8,73.8
"Idgah Hills, Bhopal - MPPCB",2026-11-07 15:00,29,72
"Idgah Hills, Bhopal - MPPCB",2026-11-07 16:00,30.3,73
"Idgah Hills, Bhopal - MPPCB",2026-11-07 17:00,37,102
"Idgah Hills, Bhopal - MPPCB",2026-11-07 18:00,65.5,180
"Idgah Hills, Bhopal - MPPCB",2026-11-07 19:00,121,255
"Idgah Hills, Bhopal - MPPCB",2026-11-07 20:00,105,211
"Idgah Hills, Bhopal - MPPCB",2026-11-07 21:00,85.3,177
"Idgah Hills, Bhopal - MPPCB",2026-11-07 22:00,77.3,163
"Idgah Hills, Bhopal - MPPCB",2026-11-07 23:00,51,119
"Idgah Hills, Bhopal - MPPCB",2026-11-08 00:00,63,134
"Idgah Hills, Bhopal - MPPCB",2026-11-08 01:00,63.5,134
"Idgah Hills, Bhopal - MPPCB",2026-11-08 02:00,46.8,113
"Idgah Hills, Bhopal - MPPCB",2026-11-08 03:00,40.5,87.8
"Idgah Hills, Bhopal - MPPCB",2026-11-08 04:00,50.3,111
"Idgah Hills, Bhopal - MPPCB",2026-11-08 05:00,49.5,107
"Idgah Hills, Bhopal - MPPCB",2026-11-08 06:00,55.3,126
"Idgah Hills, Bhopal - MPPCB",2026-11-08 07:00,70.3,169
"Idgah Hills, Bhopal - MPPCB",2026-11-08 08:00,88.5,211
"Idgah Hills, Bhopal - MPPCB",2026-11-08 09:00,48.3,129
"Idgah Hills, Bhopal - MPPCB",2026-11-08 10:00,31.5,98.3
"Idgah Hills, Bhopal - MPPCB",2026-11-08 11:00,30.8,75.5
"Idgah Hills, Bhopal - MPPCB",2026-11-08 12:00,24.3,69.5
"Idgah Hills, Bhopal - MPPCB",2026-11-08 13:00,24.3,71.5
"Idgah Hills, Bhopal - MPPCB",2026-11-08 14:00,21.3,65.8
"Idgah Hills, Bhopal - MPPCB",2026-11-08 15:00,19.3,71.8
"Idgah Hills, Bhopal - MPPCB",2026-11-08 16:00,21,78.3
"Idgah Hills, Bhopal - MPPCB",2026-11-08 17:00,38,131
"Idgah Hills, Bhopal - MPPCB",2026-11-08 18:00,80.8,257
"Idgah Hills, Bhopal - MPPCB",2026-11-08 19:00,114,317
"Idgah Hills, Bhopal - MPPCB",2026-11-08 20:00,225,453
"Idgah Hills, Bhopal - MPPCB",2026-11-08 21:00,295,570
"Idgah Hills, Bhopal - MPPCB",2026-11-08 22:00,481,700
"Idgah Hills, Bhopal - MPPCB",2026-11-08 23:00,772,`;

const C = `Station,From Date (IST),PM2.5 (µg/m³),PM10 (µg/m³)
"T T Nagar, Bhopal - MPPCB",2026-11-09 00:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-09 01:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-09 02:00,,
"T T Nagar, Bhopal - MPPCB",2026-11-09 03:00,839,
"T T Nagar, Bhopal - MPPCB",2026-11-09 04:00,649,593
"T T Nagar, Bhopal - MPPCB",2026-11-09 05:00,388,501
"T T Nagar, Bhopal - MPPCB",2026-11-09 06:00,276,366
"T T Nagar, Bhopal - MPPCB",2026-11-09 07:00,247,352
"T T Nagar, Bhopal - MPPCB",2026-11-09 08:00,222,336
"T T Nagar, Bhopal - MPPCB",2026-11-09 09:00,167,258
"T T Nagar, Bhopal - MPPCB",2026-11-09 10:00,126,202
"T T Nagar, Bhopal - MPPCB",2026-11-09 11:00,94.5,161
"T T Nagar, Bhopal - MPPCB",2026-11-09 12:00,70.5,134
"T T Nagar, Bhopal - MPPCB",2026-11-09 13:00,55,141
"T T Nagar, Bhopal - MPPCB",2026-11-09 14:00,49,138
"T T Nagar, Bhopal - MPPCB",2026-11-09 15:00,44,118
"T T Nagar, Bhopal - MPPCB",2026-11-09 16:00,42,123
"T T Nagar, Bhopal - MPPCB",2026-11-09 17:00,46.5,133
"T T Nagar, Bhopal - MPPCB",2026-11-09 18:00,63.5,151
"T T Nagar, Bhopal - MPPCB",2026-11-09 19:00,100,248
"T T Nagar, Bhopal - MPPCB",2026-11-09 20:00,151,376
"T T Nagar, Bhopal - MPPCB",2026-11-09 21:00,187,443
"T T Nagar, Bhopal - MPPCB",2026-11-09 22:00,223,535
"T T Nagar, Bhopal - MPPCB",2026-11-09 23:00,249,604
"T T Nagar, Bhopal - MPPCB",2026-11-10 00:00,183,334
"T T Nagar, Bhopal - MPPCB",2026-11-10 01:00,136,245
"T T Nagar, Bhopal - MPPCB",2026-11-10 02:00,81,144
"T T Nagar, Bhopal - MPPCB",2026-11-10 03:00,77,133
"T T Nagar, Bhopal - MPPCB",2026-11-10 04:00,80,134
"T T Nagar, Bhopal - MPPCB",2026-11-10 05:00,72,125
"T T Nagar, Bhopal - MPPCB",2026-11-10 06:00,69,122
"T T Nagar, Bhopal - MPPCB",2026-11-10 07:00,69.5,128
"T T Nagar, Bhopal - MPPCB",2026-11-10 08:00,74.5,147
"T T Nagar, Bhopal - MPPCB",2026-11-10 09:00,82,166
"T T Nagar, Bhopal - MPPCB",2026-11-10 10:00,81,163
"T T Nagar, Bhopal - MPPCB",2026-11-10 11:00,67,138
"T T Nagar, Bhopal - MPPCB",2026-11-10 12:00,48.5,111
"T T Nagar, Bhopal - MPPCB",2026-11-10 13:00,41,129
"T T Nagar, Bhopal - MPPCB",2026-11-10 14:00,37,130
"T T Nagar, Bhopal - MPPCB",2026-11-10 15:00,35,110
"T T Nagar, Bhopal - MPPCB",2026-11-10 16:00,33,117
"T T Nagar, Bhopal - MPPCB",2026-11-10 17:00,40.5,147
"T T Nagar, Bhopal - MPPCB",2026-11-10 18:00,55,210
"T T Nagar, Bhopal - MPPCB",2026-11-10 19:00,73,263
"T T Nagar, Bhopal - MPPCB",2026-11-10 20:00,89,264
"T T Nagar, Bhopal - MPPCB",2026-11-10 21:00,91.5,234
"T T Nagar, Bhopal - MPPCB",2026-11-10 22:00,82.5,218
"T T Nagar, Bhopal - MPPCB",2026-11-10 23:00,75,218
"T T Nagar, Bhopal - MPPCB",2026-11-11 00:00,83,172
"T T Nagar, Bhopal - MPPCB",2026-11-11 01:00,87,181
"T T Nagar, Bhopal - MPPCB",2026-11-11 02:00,84,170
"T T Nagar, Bhopal - MPPCB",2026-11-11 03:00,73.5,131
"T T Nagar, Bhopal - MPPCB",2026-11-11 04:00,71,111
"T T Nagar, Bhopal - MPPCB",2026-11-11 05:00,75.5,117
"T T Nagar, Bhopal - MPPCB",2026-11-11 06:00,90.5,151
"T T Nagar, Bhopal - MPPCB",2026-11-11 07:00,98.5,184
"T T Nagar, Bhopal - MPPCB",2026-11-11 08:00,109,236
"T T Nagar, Bhopal - MPPCB",2026-11-11 09:00,109,237
"T T Nagar, Bhopal - MPPCB",2026-11-11 10:00,88.5,187
"T T Nagar, Bhopal - MPPCB",2026-11-11 11:00,81,178
"T T Nagar, Bhopal - MPPCB",2026-11-11 12:00,66.5,154
"T T Nagar, Bhopal - MPPCB",2026-11-11 13:00,54,127
"T T Nagar, Bhopal - MPPCB",2026-11-11 14:00,51,118
"T T Nagar, Bhopal - MPPCB",2026-11-11 15:00,50,119
"T T Nagar, Bhopal - MPPCB",2026-11-11 16:00,61.3,133
"T T Nagar, Bhopal - MPPCB",2026-11-11 17:00,66.5,158
"T T Nagar, Bhopal - MPPCB",2026-11-11 18:00,86.5,200
"T T Nagar, Bhopal - MPPCB",2026-11-11 19:00,124,315
"T T Nagar, Bhopal - MPPCB",2026-11-11 20:00,157,403
"T T Nagar, Bhopal - MPPCB",2026-11-11 21:00,171,390
"T T Nagar, Bhopal - MPPCB",2026-11-11 22:00,164,370
"T T Nagar, Bhopal - MPPCB",2026-11-11 23:00,157,356
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 00:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 01:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 02:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 03:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 04:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 05:00,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 06:00,891,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 07:00,897,
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 08:00,755,549
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 09:00,383,483
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 10:00,185,254
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 11:00,95,151
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 12:00,64.3,105
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 13:00,44.8,88
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 14:00,38.3,90.7
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 15:00,23.3,90.5
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 16:00,33,98
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 17:00,48.3,144
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 18:00,93.3,248
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 19:00,215,363
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 20:00,363,491
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 21:00,444,597
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 22:00,522,677
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-09 23:00,512,660
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 00:00,310,429
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 01:00,257,381
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 02:00,168,228
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 03:00,136,190
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 04:00,118,168
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 05:00,105,146
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 06:00,99,134
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 07:00,105,179
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 08:00,107,238
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 09:00,88.3,196
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 10:00,83,170
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 11:00,68.5,136
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 12:00,48.8,91.8
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 13:00,37.8,79.8
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 14:00,33.8,72.8
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 15:00,31.8,71
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 16:00,28.5,69.8
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 17:00,37,90.8
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 18:00,72,164
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 19:00,122,252
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 20:00,158,298
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 21:00,220,362
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 22:00,283,448
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-10 23:00,249,446
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 00:00,174,315
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 01:00,169,258
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 02:00,118,201
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 03:00,118,168
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 04:00,107,147
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 05:00,90.8,131
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 06:00,86.3,129
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 07:00,97.8,200
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 08:00,112,311
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 09:00,103,209
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 10:00,77.3,155
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 11:00,70.3,146
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 12:00,60.3,122
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 13:00,46.5,103
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 14:00,48,101
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 15:00,49.8,96.8
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 16:00,55.3,108
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 17:00,60.5,135
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 18:00,89.5,246
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 19:00,152,350
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 20:00,210,358
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 21:00,243,375
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 22:00,251,384
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-11 23:00,272,398
"Idgah Hills, Bhopal - MPPCB",2026-11-09 00:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-09 01:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-09 02:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-09 03:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-09 04:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-09 05:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-09 06:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-09 07:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-09 08:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-09 09:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-09 10:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-09 11:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-09 12:00,26,116
"Idgah Hills, Bhopal - MPPCB",2026-11-09 13:00,27,93.3
"Idgah Hills, Bhopal - MPPCB",2026-11-09 14:00,29.8,94.5
"Idgah Hills, Bhopal - MPPCB",2026-11-09 15:00,30.3,89.8
"Idgah Hills, Bhopal - MPPCB",2026-11-09 16:00,32.8,99.8
"Idgah Hills, Bhopal - MPPCB",2026-11-09 17:00,39.3,139
"Idgah Hills, Bhopal - MPPCB",2026-11-09 18:00,82.8,241
"Idgah Hills, Bhopal - MPPCB",2026-11-09 19:00,124,321
"Idgah Hills, Bhopal - MPPCB",2026-11-09 20:00,141,349
"Idgah Hills, Bhopal - MPPCB",2026-11-09 21:00,142,317
"Idgah Hills, Bhopal - MPPCB",2026-11-09 22:00,81.8,216
"Idgah Hills, Bhopal - MPPCB",2026-11-09 23:00,84,202
"Idgah Hills, Bhopal - MPPCB",2026-11-10 00:00,115,264
"Idgah Hills, Bhopal - MPPCB",2026-11-10 01:00,130,288
"Idgah Hills, Bhopal - MPPCB",2026-11-10 02:00,77.3,192
"Idgah Hills, Bhopal - MPPCB",2026-11-10 03:00,61.5,161
"Idgah Hills, Bhopal - MPPCB",2026-11-10 04:00,46.5,124
"Idgah Hills, Bhopal - MPPCB",2026-11-10 05:00,41,109
"Idgah Hills, Bhopal - MPPCB",2026-11-10 06:00,41,112
"Idgah Hills, Bhopal - MPPCB",2026-11-10 07:00,54.8,154
"Idgah Hills, Bhopal - MPPCB",2026-11-10 08:00,64.5,187
"Idgah Hills, Bhopal - MPPCB",2026-11-10 09:00,50.8,141
"Idgah Hills, Bhopal - MPPCB",2026-11-10 10:00,50,143
"Idgah Hills, Bhopal - MPPCB",2026-11-10 11:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-10 12:00,,
"Idgah Hills, Bhopal - MPPCB",2026-11-10 13:00,27,94.5
"Idgah Hills, Bhopal - MPPCB",2026-11-10 14:00,26.3,93.3
"Idgah Hills, Bhopal - MPPCB",2026-11-10 15:00,25.8,103
"Idgah Hills, Bhopal - MPPCB",2026-11-10 16:00,23.3,77
"Idgah Hills, Bhopal - MPPCB",2026-11-10 17:00,28.5,90.3
"Idgah Hills, Bhopal - MPPCB",2026-11-10 18:00,36.3,124
"Idgah Hills, Bhopal - MPPCB",2026-11-10 19:00,51.5,151
"Idgah Hills, Bhopal - MPPCB",2026-11-10 20:00,65.3,198
"Idgah Hills, Bhopal - MPPCB",2026-11-10 21:00,56.8,162
"Idgah Hills, Bhopal - MPPCB",2026-11-10 22:00,51.8,143
"Idgah Hills, Bhopal - MPPCB",2026-11-10 23:00,39,111
"Idgah Hills, Bhopal - MPPCB",2026-11-11 00:00,66,175
"Idgah Hills, Bhopal - MPPCB",2026-11-11 01:00,68.5,184
"Idgah Hills, Bhopal - MPPCB",2026-11-11 02:00,71,181
"Idgah Hills, Bhopal - MPPCB",2026-11-11 03:00,51.3,131
"Idgah Hills, Bhopal - MPPCB",2026-11-11 04:00,37.8,98.8
"Idgah Hills, Bhopal - MPPCB",2026-11-11 05:00,41.8,102
"Idgah Hills, Bhopal - MPPCB",2026-11-11 06:00,51,125
"Idgah Hills, Bhopal - MPPCB",2026-11-11 07:00,68.8,181
"Idgah Hills, Bhopal - MPPCB",2026-11-11 08:00,84.5,243
"Idgah Hills, Bhopal - MPPCB",2026-11-11 09:00,79,233
"Idgah Hills, Bhopal - MPPCB",2026-11-11 10:00,72,205
"Idgah Hills, Bhopal - MPPCB",2026-11-11 11:00,56.8,158
"Idgah Hills, Bhopal - MPPCB",2026-11-11 12:00,45,131
"Idgah Hills, Bhopal - MPPCB",2026-11-11 13:00,37.3,101
"Idgah Hills, Bhopal - MPPCB",2026-11-11 14:00,31,93.8
"Idgah Hills, Bhopal - MPPCB",2026-11-11 15:00,30.3,88.3
"Idgah Hills, Bhopal - MPPCB",2026-11-11 16:00,37,95.5
"Idgah Hills, Bhopal - MPPCB",2026-11-11 17:00,41.5,120
"Idgah Hills, Bhopal - MPPCB",2026-11-11 18:00,76.8,206
"Idgah Hills, Bhopal - MPPCB",2026-11-11 19:00,138,344
"Idgah Hills, Bhopal - MPPCB",2026-11-11 20:00,140,392
"Idgah Hills, Bhopal - MPPCB",2026-11-11 21:00,182,481
"Idgah Hills, Bhopal - MPPCB",2026-11-11 22:00,169,382
"Idgah Hills, Bhopal - MPPCB",2026-11-11 23:00,96,254`;

const D = `Station,From Date (IST),PM2.5 (µg/m³),PM10 (µg/m³)
"T T Nagar, Bhopal - MPPCB",2026-11-12 00:00,166,401
"T T Nagar, Bhopal - MPPCB",2026-11-12 01:00,149,332
"T T Nagar, Bhopal - MPPCB",2026-11-12 02:00,132,238
"T T Nagar, Bhopal - MPPCB",2026-11-12 03:00,131,219
"T T Nagar, Bhopal - MPPCB",2026-11-12 04:00,117,197
"T T Nagar, Bhopal - MPPCB",2026-11-12 05:00,89.5,143
"T T Nagar, Bhopal - MPPCB",2026-11-12 06:00,75.5,122
"T T Nagar, Bhopal - MPPCB",2026-11-12 07:00,80,140
"T T Nagar, Bhopal - MPPCB",2026-11-12 08:00,83.5,160
"T T Nagar, Bhopal - MPPCB",2026-11-12 09:00,79,163
"T T Nagar, Bhopal - MPPCB",2026-11-12 10:00,78.5,167
"T T Nagar, Bhopal - MPPCB",2026-11-12 11:00,76,154
"T T Nagar, Bhopal - MPPCB",2026-11-12 12:00,66.5,130
"T T Nagar, Bhopal - MPPCB",2026-11-12 13:00,61,119
"T T Nagar, Bhopal - MPPCB",2026-11-12 14:00,61,116
"T T Nagar, Bhopal - MPPCB",2026-11-12 15:00,58.5,111
"T T Nagar, Bhopal - MPPCB",2026-11-12 16:00,53,107
"T T Nagar, Bhopal - MPPCB",2026-11-12 17:00,59,129
"T T Nagar, Bhopal - MPPCB",2026-11-12 18:00,65,154
"T T Nagar, Bhopal - MPPCB",2026-11-12 19:00,80.5,222
"T T Nagar, Bhopal - MPPCB",2026-11-12 20:00,107,262
"T T Nagar, Bhopal - MPPCB",2026-11-12 21:00,104,202
"T T Nagar, Bhopal - MPPCB",2026-11-12 22:00,88.5,171
"T T Nagar, Bhopal - MPPCB",2026-11-12 23:00,86,175
"T T Nagar, Bhopal - MPPCB",2026-11-13 00:00,89,194
"T T Nagar, Bhopal - MPPCB",2026-11-13 01:00,94.5,214
"T T Nagar, Bhopal - MPPCB",2026-11-13 02:00,106,203
"T T Nagar, Bhopal - MPPCB",2026-11-13 03:00,97.5,151
"T T Nagar, Bhopal - MPPCB",2026-11-13 04:00,76,118
"T T Nagar, Bhopal - MPPCB",2026-11-13 05:00,65,101
"T T Nagar, Bhopal - MPPCB",2026-11-13 06:00,71.5,106
"T T Nagar, Bhopal - MPPCB",2026-11-13 07:00,76.5,131
"T T Nagar, Bhopal - MPPCB",2026-11-13 08:00,91,172
"T T Nagar, Bhopal - MPPCB",2026-11-13 09:00,88,155
"T T Nagar, Bhopal - MPPCB",2026-11-13 10:00,63.5,116
"T T Nagar, Bhopal - MPPCB",2026-11-13 11:00,53,117
"T T Nagar, Bhopal - MPPCB",2026-11-13 12:00,44.5,106
"T T Nagar, Bhopal - MPPCB",2026-11-13 13:00,44.5,95.5
"T T Nagar, Bhopal - MPPCB",2026-11-13 14:00,45.5,95
"T T Nagar, Bhopal - MPPCB",2026-11-13 15:00,44,91.5
"T T Nagar, Bhopal - MPPCB",2026-11-13 16:00,42,89
"T T Nagar, Bhopal - MPPCB",2026-11-13 17:00,49.5,117
"T T Nagar, Bhopal - MPPCB",2026-11-13 18:00,64,161
"T T Nagar, Bhopal - MPPCB",2026-11-13 19:00,87.5,207
"T T Nagar, Bhopal - MPPCB",2026-11-13 20:00,103,260
"T T Nagar, Bhopal - MPPCB",2026-11-13 21:00,104,269
"T T Nagar, Bhopal - MPPCB",2026-11-13 22:00,96.5,221
"T T Nagar, Bhopal - MPPCB",2026-11-13 23:00,88,186
"T T Nagar, Bhopal - MPPCB",2026-11-14 00:00,99,266
"T T Nagar, Bhopal - MPPCB",2026-11-14 01:00,133,366
"T T Nagar, Bhopal - MPPCB",2026-11-14 02:00,155,396
"T T Nagar, Bhopal - MPPCB",2026-11-14 03:00,138,302
"T T Nagar, Bhopal - MPPCB",2026-11-14 04:00,131,269
"T T Nagar, Bhopal - MPPCB",2026-11-14 05:00,122,234
"T T Nagar, Bhopal - MPPCB",2026-11-14 06:00,118,208
"T T Nagar, Bhopal - MPPCB",2026-11-14 07:00,111,208
"T T Nagar, Bhopal - MPPCB",2026-11-14 08:00,99.5,193
"T T Nagar, Bhopal - MPPCB",2026-11-14 09:00,83.5,163
"T T Nagar, Bhopal - MPPCB",2026-11-14 10:00,58,121
"T T Nagar, Bhopal - MPPCB",2026-11-14 11:00,40,96.5
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 00:00,251,418
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 01:00,218,382
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 02:00,154,236
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 03:00,136,197
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 04:00,126,182
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 05:00,110,146
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 06:00,109,138
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 07:00,105,174
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 08:00,108,241
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 09:00,82.8,172
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 10:00,73.5,153
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 11:00,66.5,129
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 12:00,66.3,113
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 13:00,60,107
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 14:00,55.3,107
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 15:00,51,111
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 16:00,56.8,130
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 17:00,69.3,223
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 18:00,97.3,346
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 19:00,153,374
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 20:00,190,343
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 21:00,221,371
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 22:00,238,379
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-12 23:00,232,350
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 00:00,181,274
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 01:00,162,242
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 02:00,135,214
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 03:00,117,164
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 04:00,112,157
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 05:00,110,148
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 06:00,104,135
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 07:00,105,149
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 08:00,125,209
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 09:00,126,205
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 10:00,67.8,134
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 11:00,53.5,102
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 12:00,49,94
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 13:00,41,99
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 14:00,38.8,97.3
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 15:00,34.3,94.5
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 16:00,43,121
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 17:00,58.8,209
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 18:00,108,331
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 19:00,162,387
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 20:00,145,297
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 21:00,162,296
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 22:00,178,322
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-13 23:00,212,353
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-14 00:00,172,306
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-14 01:00,148,259
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-14 02:00,136,256
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-14 03:00,124,227
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-14 04:00,120,203
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-14 05:00,118,185
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-14 06:00,115,187
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-14 07:00,128,203
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-14 08:00,149,260
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-14 09:00,125,209
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-14 10:00,90.3,187
"Paryavaran Parisar, Bhopal - MPPCB",2026-11-14 11:00,64,128
"Idgah Hills, Bhopal - MPPCB",2026-11-12 00:00,84.5,217
"Idgah Hills, Bhopal - MPPCB",2026-11-12 01:00,73.5,190
"Idgah Hills, Bhopal - MPPCB",2026-11-12 02:00,72.5,192
"Idgah Hills, Bhopal - MPPCB",2026-11-12 03:00,73,180
"Idgah Hills, Bhopal - MPPCB",2026-11-12 04:00,68.5,164
"Idgah Hills, Bhopal - MPPCB",2026-11-12 05:00,60,146
"Idgah Hills, Bhopal - MPPCB",2026-11-12 06:00,50.3,142
"Idgah Hills, Bhopal - MPPCB",2026-11-12 07:00,60.8,175
"Idgah Hills, Bhopal - MPPCB",2026-11-12 08:00,68.3,196
"Idgah Hills, Bhopal - MPPCB",2026-11-12 09:00,55,163
"Idgah Hills, Bhopal - MPPCB",2026-11-12 10:00,47.5,135
"Idgah Hills, Bhopal - MPPCB",2026-11-12 11:00,42.5,119
"Idgah Hills, Bhopal - MPPCB",2026-11-12 12:00,41.5,117
"Idgah Hills, Bhopal - MPPCB",2026-11-12 13:00,41.3,116
"Idgah Hills, Bhopal - MPPCB",2026-11-12 14:00,35.8,113
"Idgah Hills, Bhopal - MPPCB",2026-11-12 15:00,34.5,108
"Idgah Hills, Bhopal - MPPCB",2026-11-12 16:00,33.5,99
"Idgah Hills, Bhopal - MPPCB",2026-11-12 17:00,52.5,150
"Idgah Hills, Bhopal - MPPCB",2026-11-12 18:00,101,294
"Idgah Hills, Bhopal - MPPCB",2026-11-12 19:00,91.5,269
"Idgah Hills, Bhopal - MPPCB",2026-11-12 20:00,92.8,264
"Idgah Hills, Bhopal - MPPCB",2026-11-12 21:00,82.8,236
"Idgah Hills, Bhopal - MPPCB",2026-11-12 22:00,99.3,275
"Idgah Hills, Bhopal - MPPCB",2026-11-12 23:00,151,426
"Idgah Hills, Bhopal - MPPCB",2026-11-13 00:00,119,304
"Idgah Hills, Bhopal - MPPCB",2026-11-13 01:00,100,235
"Idgah Hills, Bhopal - MPPCB",2026-11-13 02:00,115,305
"Idgah Hills, Bhopal - MPPCB",2026-11-13 03:00,138,348
"Idgah Hills, Bhopal - MPPCB",2026-11-13 04:00,67,172
"Idgah Hills, Bhopal - MPPCB",2026-11-13 05:00,44.5,115
"Idgah Hills, Bhopal - MPPCB",2026-11-13 06:00,60,141
"Idgah Hills, Bhopal - MPPCB",2026-11-13 07:00,64.3,154
"Idgah Hills, Bhopal - MPPCB",2026-11-13 08:00,57.5,156
"Idgah Hills, Bhopal - MPPCB",2026-11-13 09:00,50,131
"Idgah Hills, Bhopal - MPPCB",2026-11-13 10:00,40,117
"Idgah Hills, Bhopal - MPPCB",2026-11-13 11:00,36,97
"Idgah Hills, Bhopal - MPPCB",2026-11-13 12:00,32.5,96.5
"Idgah Hills, Bhopal - MPPCB",2026-11-13 13:00,31.5,102
"Idgah Hills, Bhopal - MPPCB",2026-11-13 14:00,31.8,95.5
"Idgah Hills, Bhopal - MPPCB",2026-11-13 15:00,29,93.3
"Idgah Hills, Bhopal - MPPCB",2026-11-13 16:00,32.5,103
"Idgah Hills, Bhopal - MPPCB",2026-11-13 17:00,44,147
"Idgah Hills, Bhopal - MPPCB",2026-11-13 18:00,77,259
"Idgah Hills, Bhopal - MPPCB",2026-11-13 19:00,91,286
"Idgah Hills, Bhopal - MPPCB",2026-11-13 20:00,97.5,288
"Idgah Hills, Bhopal - MPPCB",2026-11-13 21:00,65.8,189
"Idgah Hills, Bhopal - MPPCB",2026-11-13 22:00,44.3,144
"Idgah Hills, Bhopal - MPPCB",2026-11-13 23:00,36,121
"Idgah Hills, Bhopal - MPPCB",2026-11-14 00:00,61,163
"Idgah Hills, Bhopal - MPPCB",2026-11-14 01:00,77.5,188
"Idgah Hills, Bhopal - MPPCB",2026-11-14 02:00,84.5,216
"Idgah Hills, Bhopal - MPPCB",2026-11-14 03:00,77.5,207
"Idgah Hills, Bhopal - MPPCB",2026-11-14 04:00,84,237
"Idgah Hills, Bhopal - MPPCB",2026-11-14 05:00,72.5,184
"Idgah Hills, Bhopal - MPPCB",2026-11-14 06:00,72.5,189
"Idgah Hills, Bhopal - MPPCB",2026-11-14 07:00,68,193
"Idgah Hills, Bhopal - MPPCB",2026-11-14 08:00,61,185
"Idgah Hills, Bhopal - MPPCB",2026-11-14 09:00,40,121
"Idgah Hills, Bhopal - MPPCB",2026-11-14 10:00,37,102
"Idgah Hills, Bhopal - MPPCB",2026-11-14 11:00,28,97`;

const E = `Station,Date,PM2.5 (µg/m³),PM10 (µg/m³)
"T T Nagar, Bhopal - MPPCB",2026-10-01,40.4,122
"T T Nagar, Bhopal - MPPCB",2026-10-02,33.3,107
"T T Nagar, Bhopal - MPPCB",2026-10-03,27.5,102
"T T Nagar, Bhopal - MPPCB",2026-10-04,31.5,87.9
"T T Nagar, Bhopal - MPPCB",2026-10-05,42.6,98.7
"T T Nagar, Bhopal - MPPCB",2026-10-06,39.2,98.4
"T T Nagar, Bhopal - MPPCB",2026-10-07,38.8,130
"T T Nagar, Bhopal - MPPCB",2026-10-08,56.1,152
"T T Nagar, Bhopal - MPPCB",2026-10-09,52.3,119
"T T Nagar, Bhopal - MPPCB",2026-10-10,40.1,93.7
"T T Nagar, Bhopal - MPPCB",2026-10-11,35.7,90.4
"T T Nagar, Bhopal - MPPCB",2026-10-12,43.5,103
"T T Nagar, Bhopal - MPPCB",2026-10-13,42.1,101
"T T Nagar, Bhopal - MPPCB",2026-10-14,47.5,102
"T T Nagar, Bhopal - MPPCB",2026-10-15,49.9,103
"T T Nagar, Bhopal - MPPCB",2026-10-16,57,118
"T T Nagar, Bhopal - MPPCB",2026-10-17,57.8,111
"T T Nagar, Bhopal - MPPCB",2026-10-18,63.3,119
"T T Nagar, Bhopal - MPPCB",2026-10-19,61.7,122
"T T Nagar, Bhopal - MPPCB",2026-10-20,64.8,112
"T T Nagar, Bhopal - MPPCB",2026-10-21,52.8,91.3
"T T Nagar, Bhopal - MPPCB",2026-10-22,46.6,105
"T T Nagar, Bhopal - MPPCB",2026-10-23,47.3,115
"T T Nagar, Bhopal - MPPCB",2026-10-24,,
"T T Nagar, Bhopal - MPPCB",2026-10-25,,
"T T Nagar, Bhopal - MPPCB",2026-10-26,,
"T T Nagar, Bhopal - MPPCB",2026-10-27,50.8,148
"T T Nagar, Bhopal - MPPCB",2026-10-28,56.1,132
"T T Nagar, Bhopal - MPPCB",2026-10-29,32.5,54.5
"T T Nagar, Bhopal - MPPCB",2026-10-30,22.9,48.1
"T T Nagar, Bhopal - MPPCB",2026-10-31,24.1,61.5
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-01,45.7,133
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-02,42.3,117
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-03,39.2,119
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-04,35.3,98.5
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-05,45.4,119
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-06,48.6,123
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-07,46.6,126
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-08,59.4,150
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-09,61.1,156
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-10,49,114
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-11,42.5,101
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-12,51.8,132
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-13,50.4,145
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-14,56,146
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-15,62.4,158
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-16,67.2,162
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-17,71.9,166
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-18,74.9,141
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-19,72.5,153
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-20,71,158
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-21,50.7,116
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-22,58.5,155
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-23,57,140
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-24,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-25,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-26,,
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-27,46.3,144
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-28,53.6,124
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-29,28,50
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-30,16.6,39.6
"Paryavaran Parisar, Bhopal - MPPCB",2026-10-31,29.7,72.2
"Idgah Hills, Bhopal - MPPCB",2026-10-01,28.7,108
"Idgah Hills, Bhopal - MPPCB",2026-10-02,28.8,102
"Idgah Hills, Bhopal - MPPCB",2026-10-03,29,105
"Idgah Hills, Bhopal - MPPCB",2026-10-04,28.3,103
"Idgah Hills, Bhopal - MPPCB",2026-10-05,32.8,108
"Idgah Hills, Bhopal - MPPCB",2026-10-06,33.5,106
"Idgah Hills, Bhopal - MPPCB",2026-10-07,29.5,114
"Idgah Hills, Bhopal - MPPCB",2026-10-08,39.3,138
"Idgah Hills, Bhopal - MPPCB",2026-10-09,42.8,121
"Idgah Hills, Bhopal - MPPCB",2026-10-10,39.5,107
"Idgah Hills, Bhopal - MPPCB",2026-10-11,35.4,101
"Idgah Hills, Bhopal - MPPCB",2026-10-12,38.9,111
"Idgah Hills, Bhopal - MPPCB",2026-10-13,37.6,106
"Idgah Hills, Bhopal - MPPCB",2026-10-14,39,107
"Idgah Hills, Bhopal - MPPCB",2026-10-15,43.3,116
"Idgah Hills, Bhopal - MPPCB",2026-10-16,40.1,111
"Idgah Hills, Bhopal - MPPCB",2026-10-17,44.9,119
"Idgah Hills, Bhopal - MPPCB",2026-10-18,47.6,115
"Idgah Hills, Bhopal - MPPCB",2026-10-19,45.3,114
"Idgah Hills, Bhopal - MPPCB",2026-10-20,48.1,119
"Idgah Hills, Bhopal - MPPCB",2026-10-21,39.7,98.9
"Idgah Hills, Bhopal - MPPCB",2026-10-22,38.9,107
"Idgah Hills, Bhopal - MPPCB",2026-10-23,34.3,95.7
"Idgah Hills, Bhopal - MPPCB",2026-10-24,,
"Idgah Hills, Bhopal - MPPCB",2026-10-25,,
"Idgah Hills, Bhopal - MPPCB",2026-10-26,,
"Idgah Hills, Bhopal - MPPCB",2026-10-27,47.1,168
"Idgah Hills, Bhopal - MPPCB",2026-10-28,40.5,119
"Idgah Hills, Bhopal - MPPCB",2026-10-29,25.7,69.7
"Idgah Hills, Bhopal - MPPCB",2026-10-30,18.2,49.5
"Idgah Hills, Bhopal - MPPCB",2026-10-31,22.9,66.8`;

export const SAMPLES: Sample[] = [
  {
    id: "A",
    label: "Bhopal, 3 to 5 Nov 2026",
    period: "3 to 5 Nov 2026",
    description: "Hourly, 61 hours with no PM2.5 reading",
    text: A,
  },
  {
    id: "B",
    label: "Bhopal, 6 to 8 Nov 2026",
    period: "6 to 8 Nov 2026",
    description: "Hourly, Diwali night: Idgah Hills reaches 772 µg/m³ by 23:00",
    text: B,
  },
  {
    id: "C",
    label: "Bhopal, 9 to 11 Nov 2026",
    period: "9 to 11 Nov 2026",
    description: "Hourly, the days after Diwali, 23 hours missing",
    text: C,
  },
  {
    id: "D",
    label: "Bhopal, 12 to 14 Nov 2026",
    period: "12 to 14 Nov 2026",
    description: "Hourly up to 11:00 on 14 Nov, no gaps",
    text: D,
  },
  {
    id: "E",
    label: "Bhopal, 1 to 31 Oct 2026",
    period: "1 to 31 Oct 2026",
    description: "Daily averages, 24 to 26 Oct missing at every station",
    text: E,
  },
];
