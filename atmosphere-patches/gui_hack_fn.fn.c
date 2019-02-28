// IAIN HACK DISPLAY SPLASH PAGE
GUI_Clear();
if (in->data[0]) {
  switch (in->data[0]) {
    case 'b':
      GUI_GIF_Draw(_img_cool, _img_cool_length, 30, 5);
      break;
    case 'c':
      GUI_GIF_Draw(_img_cry, _img_cry_length, 30, 5);
      break;
    case 'd':
      GUI_GIF_Draw(_img_dead, _img_dead_length, 30, 5);
      break;
    case 'e':
      GUI_GIF_Draw(_img_eat, _img_eat_length, 30, 5);
      break;
    case 'f':
      GUI_GIF_Draw(_img_happy, _img_happy_length, 30, 5);
      break;
    case 'g':
      GUI_GIF_Draw(_img_hello, _img_hello_length, 30, 5);
      break;
    case 'h':
      GUI_GIF_Draw(_img_hungry, _img_hungry_length, 30, 5);
      break;
    case 'i':
      GUI_GIF_Draw(_img_laughing, _img_laughing_length, 30, 5);
      break;
    case 'j':
      GUI_GIF_Draw(_img_music, _img_music_length, 30, 5);
      break;
    case 'k':
      GUI_GIF_Draw(_img_sad, _img_sad_length, 30, 5);
      break;
    case 'l':
      GUI_GIF_Draw(_img_selfie, _img_selfie_length, 30, 5);
      break;
    case 'm':
      GUI_GIF_Draw(_img_shower, _img_shower_length, 30, 5);
      break;
    case 'n':
      GUI_GIF_Draw(_img_sick, _img_sick_length, 30, 5);
      break;
  }
}

char txtWindow[41];
if (in->data[1] != '\0') {
  int si;
  for (si = 0; si < 40; si++) {
    txtWindow[si] = in->data[si+1];
    if (txtWindow[si] == '\0') break;
  }
  txtWindow[si+1] = '\0';
}

GUI_SetFont(&GUI_Font20_ASCII);
GUI_SetTextMode(GUI_TM_NORMAL);
GUI_DispStringHCenterAt(txtWindow, 172/2, 172 - 24);

// END HACK
