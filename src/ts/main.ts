import { initNavigation } from '../components/navigation/navigation';
import { clickService, initServiceSliders, revealServiceBlocks } from '../components/services/service';
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  clickService();
  initServiceSliders();
  revealServiceBlocks();
});