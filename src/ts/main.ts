import { initNavigation } from '../components/navigation/navigation';
import {
  clickService,
  initServiceLightbox,
  initServiceSliders,
  revealServiceBlocks,
} from '../components/services/service';
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  clickService();
  initServiceSliders();
  initServiceLightbox();
  revealServiceBlocks();
});