import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

/* Import specific icons */
import {
    faArrowRight,
    faArrowLeft,
    faStar as faStarSolid,
    faCheck,
    faCheckCircle,
    faTimes,
    faPlus,
    faTrash,
    faCalendarAlt,
    faClock,
    faExclamationTriangle,
    faChevronDown,
    faChevronUp,
    faChevronRight,
    faDatabase,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';

/* Add icons to the library */
library.add(
    faArrowRight,
    faArrowLeft,
    faStarSolid,
    faCheck,
    faCheckCircle,
    faTimes,
    faPlus,
    faTrash,
    faCalendarAlt,
    faClock,
    faExclamationTriangle,
    faChevronDown,
    faChevronUp,
    faChevronRight,
    faDatabase,
    faSpinner
);

export default FontAwesomeIcon;
