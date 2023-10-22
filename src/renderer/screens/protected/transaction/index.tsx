/* eslint-disable consistent-return */
/* eslint-disable default-param-last */
/* eslint-disable no-plusplus */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/no-unstable-nested-components */
import { Button, Chip, IconButton, Switch, styled } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import ItemDTO from 'App/data-transfer-objects/item.dto';
import IPagination from 'App/interfaces/pagination/pagination.interface';
import ItemCard from 'UI/components/Cards/ItemCard';
import useAlert from 'UI/hooks/useAlert';
import useSearch from 'UI/hooks/useSearch';
import React, { useCallback, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { AutoSizer, List } from 'react-virtualized';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import POSMenu from 'UI/components/Menu/PosMenu';
import CategoryDTO from 'App/data-transfer-objects/category.dto';

const CARD_WIDTH = 325;
const CARD_HEIGHT = 460;

const PaymentUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#000',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg enable-background="new 0 0 780 500" height="10" viewBox="0 0 780 500" width="780" xmlns="http://www.w3.org/2000/svg"><g transform="translate(15 15)"><path d="m709.241 1h-669.485c-21.128 0-38.256 16.705-38.256 37.31v391.756c0 20.604 17.128 37.31 38.256 37.31h669.485c21.132 0 38.259-16.705 38.259-37.31v-391.756c0-20.605-17.127-37.31-38.259-37.31z" fill="none" stroke="${encodeURIComponent(
          '#393939'
        )}" stroke-width="30"/><g fill-opacity=".196"><path d="m677.65 276.44h4.016l.384 10.516h10.945l-10.12-23.386 3.796-1.609 11.165 25.315v3.219h-15.73v9.009h-4.456v-9.009h-4.893v-3.539h4.893zm-23.625-14.479c3.851 0 7.534 1.287 10.726 4.29l-2.477 2.735c-2.529-2.306-4.785-3.431-8.028-3.431-4.015 0-7.205 2.197-7.205 6.273 0 4.452 3.576 6.491 7.205 6.491h2.255l.55 3.54h-3.19c-4.454 0-7.862 1.716-7.862 7.022 0 4.615 3.133 7.563 8.468 7.563 3.082 0 6.271-1.232 8.414-3.698l3.079 2.466c-2.858 3.432-7.368 4.882-11.604 4.882-7.808 0-13.144-4.826-13.144-11.213 0-5.733 4.181-8.739 8.636-9.062-4.016-.752-7.425-4.13-7.425-8.579-.001-5.042 4.509-9.279 11.602-9.279zm-32.973 0c5.112 0 8.524 1.771 11.548 5.31l-3.189 2.361c-2.421-2.738-4.454-3.917-8.193-3.917-4.236 0-6.766 2.575-6.766 6.706 0 6.06 3.078 10.081 17.377 23.437v3.646h-22.492l-.549-3.807h17.817c-12.483-11.103-16.937-16.629-16.937-23.383 0-5.901 4.232-10.353 11.384-10.353zm-34.681.644 11.218 6.757-1.981 3.164-8.688-5.095v28.426h9.352v3.646h-21.834v-3.646h7.919v-33.252zm-73.593 13.835h4.014l.385 10.516h10.944l-10.119-23.386 3.793-1.609 11.164 25.315v3.219h-15.726v9.009h-4.455v-9.009h-4.896v-3.539h4.896zm-23.625-14.479c3.849 0 7.531 1.287 10.722 4.29l-2.475 2.735c-2.529-2.306-4.784-3.431-8.028-3.431-4.016 0-7.204 2.197-7.204 6.273 0 4.452 3.574 6.491 7.204 6.491h2.255l.55 3.54h-3.19c-4.454 0-7.864 1.716-7.864 7.022 0 4.615 3.135 7.563 8.471 7.563 3.077 0 6.268-1.232 8.413-3.698l3.08 2.466c-2.86 3.432-7.37 4.882-11.604 4.882-7.812 0-13.145-4.826-13.145-11.213 0-5.733 4.18-8.739 8.634-9.062-4.015-.752-7.425-4.13-7.425-8.579 0-5.042 4.51-9.279 11.606-9.279zm-32.977 0c5.116 0 8.525 1.771 11.55 5.31l-3.191 2.361c-2.418-2.738-4.452-3.917-8.192-3.917-4.233 0-6.765 2.575-6.765 6.706 0 6.06 3.08 10.081 17.378 23.437v3.646h-22.492l-.549-3.807h17.817c-12.485-11.103-16.939-16.629-16.939-23.383 0-5.901 4.233-10.353 11.383-10.353zm-34.678.644 11.218 6.757-1.98 3.164-8.688-5.095v28.426h9.349v3.646h-21.833v-3.646h7.921v-33.252zm-73.594 13.835h4.014l.385 10.516h10.944l-10.119-23.386 3.796-1.609 11.162 25.315v3.219h-15.729v9.009h-4.453v-9.009h-4.895v-3.539h4.895zm-23.626-14.479c3.85 0 7.536 1.287 10.725 4.29l-2.476 2.735c-2.53-2.306-4.785-3.431-8.03-3.431-4.014 0-7.204 2.197-7.204 6.273 0 4.452 3.574 6.491 7.204 6.491h2.256l.55 3.54h-3.19c-4.456 0-7.866 1.716-7.866 7.022 0 4.615 3.136 7.563 8.47 7.563 3.08 0 6.269-1.232 8.416-3.698l3.079 2.466c-2.86 3.432-7.368 4.882-11.604 4.882-7.81 0-13.143-4.826-13.143-11.213 0-5.733 4.18-8.739 8.634-9.062-4.015-.752-7.424-4.13-7.424-8.579 0-5.042 4.51-9.279 11.603-9.279zm-32.974 0c5.114 0 8.523 1.771 11.548 5.31l-3.189 2.361c-2.42-2.738-4.456-3.917-8.194-3.917-4.234 0-6.765 2.575-6.765 6.706 0 6.06 3.081 10.081 17.378 23.437v3.646h-22.493l-.549-3.807h17.817c-12.482-11.103-16.938-16.629-16.938-23.383.001-5.901 4.236-10.353 11.385-10.353zm-34.679.644 11.219 6.757-1.979 3.164-8.689-5.095v28.426h9.349v3.646h-21.834v-3.646h7.919v-33.252zm-73.595 13.835h4.015l.385 10.516h10.944l-10.119-23.386 3.793-1.609 11.165 25.315v3.219h-15.729v9.009h-4.455v-9.009h-4.894v-3.539h4.894v-10.516zm-23.625-14.479c3.849 0 7.533 1.287 10.723 4.29l-2.473 2.735c-2.53-2.306-4.785-3.431-8.029-3.431-4.016 0-7.205 2.197-7.205 6.273 0 4.452 3.575 6.491 7.205 6.491h2.254l.55 3.54h-3.189c-4.454 0-7.864 1.716-7.864 7.022 0 4.615 3.134 7.563 8.469 7.563 3.08 0 6.269-1.232 8.414-3.698l3.079 2.466c-2.859 3.432-7.369 4.882-11.602 4.882-7.81 0-13.145-4.826-13.145-11.213 0-5.733 4.18-8.739 8.635-9.062-4.016-.752-7.425-4.13-7.425-8.579-.001-5.042 4.509-9.279 11.603-9.279zm-32.974 0c5.115 0 8.524 1.771 11.548 5.31l-3.19 2.361c-2.419-2.738-4.454-3.917-8.194-3.917-4.234 0-6.765 2.575-6.765 6.706 0 6.06 3.08 10.081 17.379 23.437v3.646h-22.492l-.551-3.807h17.818c-12.483-11.103-16.938-16.629-16.938-23.383.001-5.901 4.235-10.353 11.385-10.353zm-34.68.644 11.219 6.757-1.98 3.164-8.688-5.095v28.426h9.349v3.646h-21.834v-3.646h7.919v-33.252z"/><path d="m698.27 366.58v-2.515c-2.429-.229-4.122-.613-5.081-1.146-.96-.548-1.676-1.829-2.15-3.846h-2.652v25.979h3.588v-18.472zm-21.297 0v-2.515c-2.428-.229-4.12-.613-5.08-1.146-.959-.548-1.675-1.829-2.146-3.846h-2.656v25.979h3.589v-18.472h6.296zm-29.437 18.472c-.126-2.247-.6-4.202-1.422-5.866-.834-1.664-2.453-3.177-4.857-4.536l-3.584-2.021c-1.608-.912-2.736-1.688-3.382-2.333-1.023-1.009-1.533-2.16-1.533-3.463 0-1.517.468-2.719 1.402-3.606.935-.899 2.178-1.349 3.736-1.349 2.303 0 3.896.851 4.781 2.551.474.912.735 2.174.783 3.789h3.421c-.038-2.271-.467-4.124-1.29-5.556-1.457-2.525-4.027-3.789-7.714-3.789-3.065 0-5.301.807-6.708 2.423-1.418 1.616-2.13 3.414-2.13 5.393 0 2.091.754 3.875 2.261 5.355.873.862 2.436 1.907 4.689 3.135l2.561 1.383c1.22.655 2.178 1.282 2.876 1.878 1.245 1.057 2.029 2.23 2.351 3.517h-14.606v3.096h18.365zm-30.038.711c3.163 0 5.459-.845 6.892-2.533 1.42-1.699 2.131-3.764 2.131-6.191h-3.513c-.149 1.686-.474 2.914-.971 3.678-.872 1.372-2.447 2.058-4.728 2.058-1.769 0-3.188-.461-4.257-1.385-1.072-.92-1.606-2.11-1.606-3.569 0-1.798.564-3.055 1.696-3.771 1.123-.717 2.685-1.074 4.691-1.074.223 0 .453.007.69.019.226 0 .455.007.692.019v-2.896c-.351.036-.643.06-.878.072-.237.013-.493.02-.766.02-1.258 0-2.293-.196-3.103-.585-1.421-.681-2.13-1.895-2.13-3.645 0-1.298.475-2.301 1.421-3.005.945-.704 2.048-1.057 3.306-1.057 2.24 0 3.791.727 4.651 2.186.473.803.741 1.945.805 3.427h3.323c0-1.943-.398-3.597-1.194-4.957-1.372-2.429-3.781-3.643-7.229-3.643-2.728 0-4.839.595-6.335 1.785-1.492 1.178-2.241 2.891-2.241 5.138 0 1.604.442 2.903 1.325 3.898.549.619 1.26 1.105 2.132 1.457-1.407.376-2.503 1.105-3.287 2.188-.798 1.067-1.197 2.379-1.197 3.936 0 2.488.842 4.517 2.524 6.084 1.681 1.562 4.066 2.346 7.156 2.346zm-26.694-7.36c-.225 1.87-1.115 3.164-2.67 3.88-.799.364-1.719.546-2.765.546-1.994 0-3.47-.618-4.428-1.857-.962-1.238-1.44-2.612-1.44-4.118 0-1.821.573-3.23 1.72-4.225 1.133-.997 2.497-1.495 4.092-1.495 1.157 0 2.153.218 2.987.655.822.438 1.526 1.045 2.112 1.822l2.914-.164-2.039-14.046h-13.896v3.169h11.376l1.139 7.252c-.622-.462-1.213-.808-1.772-1.039-.998-.4-2.151-.603-3.458-.603-2.452 0-4.533.772-6.238 2.316-1.708 1.54-2.559 3.496-2.559 5.865 0 2.466.782 4.64 2.353 6.522 1.558 1.881 4.047 2.823 7.474 2.823 2.178 0 4.109-.594 5.789-1.786 1.668-1.201 2.603-3.041 2.803-5.519h-3.494zm-26.973-8.508c-1.482 0-2.642-.399-3.477-1.201-.834-.814-1.252-1.78-1.252-2.897 0-.974.401-1.865 1.195-2.678.798-.813 2.014-1.221 3.644-1.221 1.619 0 2.79.407 3.512 1.221.724.812 1.084 1.767 1.084 2.858 0 1.229-.466 2.186-1.4 2.879s-2.037 1.039-3.306 1.039zm-.207 12.917c-1.556 0-2.845-.408-3.867-1.22-1.033-.828-1.551-2.053-1.551-3.68 0-1.691.531-2.971 1.589-3.845 1.06-.876 2.417-1.312 4.073-1.312 1.605 0 2.921.45 3.939 1.348 1.009.888 1.515 2.118 1.515 3.7 0 1.357-.46 2.538-1.382 3.533-.935.982-2.374 1.476-4.316 1.476zm4.781-11.66c.935-.39 1.663-.846 2.187-1.368.985-.971 1.477-2.233 1.477-3.79 0-1.94-.725-3.609-2.169-5.008-1.444-1.396-3.491-2.095-6.144-2.095-2.566 0-4.577.662-6.036 1.987-1.455 1.309-2.184 2.847-2.184 4.607 0 1.627.423 2.945 1.27 3.953.475.57 1.209 1.13 2.206 1.677-1.108.496-1.981 1.068-2.616 1.711-1.186 1.216-1.773 2.794-1.773 4.738 0 2.295.789 4.244 2.369 5.848 1.584 1.591 3.818 2.387 6.709 2.387 2.602 0 4.805-.686 6.612-2.061 1.794-1.382 2.688-3.388 2.688-6.011 0-1.543-.384-2.872-1.156-3.988-.773-1.129-1.92-1.993-3.44-2.587z"/><path d="m519.2 367.54v-2.515c-2.427-.231-4.121-.611-5.078-1.147-.961-.546-1.678-1.829-2.148-3.844h-2.653v25.98h3.587v-18.474zm-27.569 19.185c3.161 0 5.46-.845 6.893-2.531 1.419-1.702 2.13-3.767 2.13-6.196h-3.513c-.149 1.688-.474 2.916-.971 3.679-.872 1.373-2.447 2.06-4.725 2.06-1.771 0-3.189-.461-4.26-1.385-1.074-.922-1.608-2.112-1.608-3.57 0-1.798.567-3.055 1.701-3.771 1.12-.717 2.683-1.075 4.688-1.075.224 0 .454.008.69.019.226 0 .456.007.69.021v-2.899c-.347.037-.64.062-.877.074-.237.015-.49.018-.765.018-1.258 0-2.292-.194-3.104-.583-1.417-.681-2.127-1.896-2.127-3.643 0-1.3.471-2.303 1.42-3.006.945-.705 2.047-1.057 3.303-1.057 2.244 0 3.795.729 4.653 2.186.475.801.74 1.942.804 3.426h3.325c0-1.943-.399-3.597-1.195-4.956-1.371-2.429-3.781-3.644-7.229-3.644-2.728 0-4.838.594-6.332 1.784-1.494 1.179-2.242 2.89-2.242 5.139 0 1.603.441 2.903 1.325 3.9.549.615 1.26 1.102 2.132 1.456-1.408.377-2.504 1.104-3.29 2.185-.796 1.071-1.195 2.383-1.195 3.937 0 2.49.843 4.517 2.523 6.083 1.681 1.568 4.065 2.353 7.152 2.353h.004zm-12.554-.71c-.123-2.25-.599-4.205-1.42-5.868-.833-1.662-2.454-3.177-4.856-4.536l-3.586-2.022c-1.607-.909-2.733-1.688-3.38-2.331-1.023-1.009-1.534-2.161-1.534-3.461 0-1.518.468-2.722 1.402-3.607.933-.899 2.178-1.349 3.734-1.349 2.305 0 3.899.851 4.782 2.551.474.91.735 2.174.784 3.79h3.42c-.037-2.272-.467-4.125-1.288-5.558-1.457-2.527-4.031-3.787-7.717-3.787-3.063 0-5.299.805-6.705 2.422-1.42 1.615-2.13 3.412-2.13 5.392 0 2.088.753 3.876 2.261 5.356.871.863 2.434 1.906 4.689 3.133l2.558 1.385c1.221.656 2.178 1.281 2.878 1.876 1.244 1.058 2.03 2.229 2.354 3.518h-14.61v3.099zm-23.761-18.475v-2.515c-2.429-.231-4.121-.611-5.08-1.147-.96-.546-1.676-1.829-2.148-3.844h-2.651v25.98h3.584v-18.474zm-38.179 19.185c3.161 0 5.458-.845 6.891-2.531 1.42-1.702 2.129-3.767 2.129-6.196h-3.512c-.147 1.688-.472 2.916-.971 3.679-.87 1.373-2.446 2.06-4.727 2.06-1.768 0-3.188-.461-4.258-1.385-1.072-.922-1.608-2.112-1.608-3.57 0-1.798.568-3.055 1.701-3.771 1.12-.717 2.683-1.075 4.688-1.075.225 0 .453.008.692.019.224 0 .455.007.691.021v-2.899c-.348.037-.643.062-.879.074-.238.015-.492.018-.768.018-1.256 0-2.29-.194-3.098-.583-1.42-.681-2.132-1.896-2.132-3.643 0-1.3.474-2.303 1.421-3.006.945-.705 2.046-1.057 3.307-1.057 2.241 0 3.791.729 4.65 2.186.473.801.74 1.942.804 3.426h3.324c0-1.943-.397-3.597-1.196-4.956-1.369-2.429-3.777-3.644-7.227-3.644-2.728 0-4.839.594-6.334 1.784-1.493 1.179-2.241 2.89-2.241 5.139 0 1.603.442 2.903 1.325 3.9.55.615 1.257 1.102 2.131 1.456-1.408.377-2.503 1.104-3.287 2.185-.797 1.071-1.196 2.383-1.196 3.937 0 2.49.842 4.517 2.521 6.083 1.684 1.564 4.068 2.349 7.159 2.349zm-24.007-9.948v-11.823l8.575 11.823zm-.056 9.238v-6.377h11.731v-3.207l-12.253-16.578h-2.839v16.925h-3.943v2.859h3.943v6.378zm-13.317-6.651c-.225 1.869-1.115 3.162-2.672 3.879-.798.366-1.718.548-2.764.548-1.994 0-3.469-.62-4.429-1.858-.958-1.238-1.438-2.611-1.438-4.116 0-1.823.574-3.233 1.718-4.228 1.134-.996 2.499-1.494 4.091-1.494 1.16 0 2.153.217 2.99.656.821.437 1.524 1.044 2.111 1.822l2.914-.164-2.038-14.047h-13.897v3.17h11.378l1.138 7.252c-.624-.463-1.214-.81-1.774-1.04-.996-.4-2.148-.602-3.457-.602-2.453 0-4.532.771-6.237 2.314-1.707 1.542-2.561 3.497-2.561 5.866 0 2.467.784 4.639 2.354 6.521 1.556 1.884 4.047 2.825 7.472 2.825 2.178 0 4.111-.595 5.791-1.785 1.668-1.202 2.603-3.043 2.804-5.521h-3.494zm-21.296 0c-.225 1.869-1.114 3.162-2.672 3.879-.797.366-1.718.548-2.764.548-1.993 0-3.468-.62-4.428-1.858-.959-1.238-1.437-2.611-1.437-4.116 0-1.823.572-3.233 1.718-4.228 1.133-.996 2.497-1.494 4.091-1.494 1.156 0 2.154.217 2.988.656.821.437 1.527 1.044 2.111 1.822l2.914-.164-2.037-14.047h-13.897v3.17h11.375l1.139 7.252c-.622-.463-1.214-.81-1.776-1.04-.995-.4-2.146-.602-3.454-.602-2.454 0-4.533.771-6.239 2.314-1.707 1.542-2.559 3.497-2.559 5.866 0 2.467.784 4.639 2.353 6.521 1.557 1.884 4.047 2.825 7.472 2.825 2.181 0 4.111-.595 5.792-1.785 1.667-1.202 2.602-3.043 2.802-5.521h-3.495.003z"/></g><path d="m7.5 144.64h732v-95.142h-732z" fill="${encodeURIComponent(
          '#393939'
        )}" stroke="${encodeURIComponent(
          '#393939'
        )}"/><path d="m41.669 166.1h537.5v74.62h-537.5z" fill-opacity=".196"/><path d="m496.92 187.18-9.754 5.877 1.721 2.751 7.555-4.43v24.718h-8.128v3.172h18.983v-3.172h-6.885v-28.916zm27.191-.559c-4.446 0-7.412 1.54-10.044 4.617l2.775 2.052c2.104-2.378 3.874-3.405 7.125-3.405 3.683 0 5.882 2.238 5.882 5.83 0 5.27-2.679 8.769-15.109 20.381v3.172h19.557l.479-3.312h-15.494c10.855-9.653 14.729-14.458 14.729-20.333 0-5.131-3.683-9.002-9.9-9.002zm28.673 0c-3.348 0-6.551 1.12-9.324 3.731l2.151 2.377c2.2-2.005 4.161-2.984 6.981-2.984 3.491 0 6.265 1.911 6.265 5.456 0 3.871-3.107 5.644-6.265 5.644h-1.96l-.479 3.078h2.773c3.874 0 6.84 1.493 6.84 6.109 0 4.011-2.727 6.577-7.365 6.577-2.676 0-5.451-1.073-7.316-3.218l-2.679 2.145c2.488 2.985 6.41 4.244 10.092 4.244 6.791 0 11.428-4.198 11.428-9.748 0-4.989-3.634-7.601-7.507-7.881 3.491-.652 6.456-3.591 6.456-7.462 0-4.384-3.921-8.068-10.091-8.068z" stroke="${encodeURIComponent(
          '393939'
        )}"/></g></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#fff' : '#fff',
    width: 32,
    height: 32,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg width="24" height="17" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 8.5C14.315 7.81501 13.1087 7.33855 12 7.30872M9 15C9.64448 15.8593 10.8428 16.3494 12 16.391M12 7.30872C10.6809 7.27322 9.5 7.86998 9.5 9.50001C9.5 12.5 15 11 15 14C15 15.711 13.5362 16.4462 12 16.391M12 7.30872V5.5M12 16.391V18.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

const getItems = async (
  searchText = '',
  categoryIds: Array<number>
): Promise<IPagination<ItemDTO>> => {
  const res = await window.item.getItems(
    { name: searchText, category_id: categoryIds },
    0,
    'max'
  );

  if (res.status === 'ERROR') {
    const errorMessage = res.errors?.[0] as unknown as string;
    throw new Error(errorMessage);
  }

  return res.data as IPagination<ItemDTO>;
};

const getCategories = async (): Promise<IPagination<CategoryDTO>> => {
  const res = await window.category.getCategories('all', 0, 'max');

  if (res.status === 'ERROR') {
    const errorMessage = res.errors?.[0] as unknown as string;
    throw new Error(errorMessage);
  }

  return res.data as unknown as IPagination<CategoryDTO>;
};

export default function Transaction() {
  const { displayAlert } = useAlert();
  const { searchText } = useSearch();
  const [selectedItemIds, setSelectedItemIds] = useState<Array<string>>([]);
  const [orders, setOrders] = useState<Record<string, number>>({});
  const [posMenuAnchorEl, setPosMenuAnchorEl] = useState<HTMLElement | null>();
  const [categoryIds, setCategoryIds] = useState<Array<number>>([]);

  // Payment switch
  const [checked, setChecked] = useState(true);
  const selectedPaymentMethod = checked ? 'Card' : 'Cash';

  const { data, refetch: refetchItems } = useQuery({
    queryKey: ['items', searchText, categoryIds],
    queryFn: async () => {
      const res = await getItems(searchText, categoryIds);

      return res;
    },
  });

  const { data: categs } = useQuery({
    queryKey: ['categories', searchText],
    queryFn: async () => {
      const res = await getCategories();

      return res;
    },
  });

  const items = useMemo(() => {
    return (
      data?.data.filter(({ name }) =>
        name.toLowerCase().includes(searchText?.toLowerCase() ?? '')
      ) ?? []
    );
  }, [data, searchText]);
  const categories = useMemo(
    () => (categs?.data as CategoryDTO[]) ?? [],
    [categs]
  );

  const selectedItems = useMemo(() => {
    if (items && items.length && selectedItemIds.length) {
      return items.filter(({ id }) => selectedItemIds.includes(id));
    }

    return [];
  }, [items, selectedItemIds]);

  const subTotal = useMemo(() => {
    const ids = Object.keys(orders);

    if (ids.length) {
      return selectedItems.reduce((prev, curr) => {
        const quantity = orders[curr.id];

        return prev + curr.selling_price * quantity;
      }, 0);
    }

    return 0;
  }, [selectedItems, orders]);

  const computedTax = selectedItems.reduce((prev, curr) => {
    return prev + curr.tax_rate;
  }, 0);

  const tax = useMemo(() => {
    if (selectedItems.length) {
      return subTotal * (computedTax / 100);
    }

    return 0;
  }, [computedTax, selectedItems.length, subTotal]);

  const total = subTotal - tax;

  const handleSelectItem = useCallback(
    (id: string) => {
      if (selectedItemIds.includes(id)) return;

      setOrders((userOrders) => ({
        ...userOrders,
        [id]: 1,
      }));

      setSelectedItemIds((selectedIds) => {
        return [...selectedIds, id];
      });
    },
    [selectedItemIds]
  );

  const handleIterateOrderQuantity = (
    action: 'add' | 'minus' = 'add',
    id: string
  ) => {
    if (action === 'add') {
      setOrders((userOrders) => ({
        ...userOrders,
        [id]: userOrders[id] + 1,
      }));
    }

    if (action === 'minus') {
      if (orders[id] - 1 <= 0) {
        const tempOrders = orders;

        if (orders[id] - 1 <= 0) {
          delete tempOrders[id];
          const filteredSelectedIds = selectedItemIds.filter(
            (itemId) => itemId !== id
          );

          setSelectedItemIds(filteredSelectedIds);
          return setOrders(tempOrders);
        }
      }

      setOrders((userOrders) => ({
        ...userOrders,
        [id]: userOrders[id] - 1,
      }));
    }
  };

  const rowRenderer = useCallback(
    ({ index, key, style, cardsPerRow }: Record<string, any>) => {
      const cards = [];
      const fromIndex = index * cardsPerRow;
      const toIndex = Math.min(fromIndex + cardsPerRow, items.length);

      // eslint-disable-next-line no-plusplus, @typescript-eslint/no-shadow
      for (let i = fromIndex; i < toIndex; i++) {
        const card = items[i];

        cards.push(
          <div key={i}>
            <ItemCard cardInfo={card} onSelect={handleSelectItem} />
          </div>
        );
      }

      return (
        <div className="flex flex-row flex-wrap gap-3" key={key} style={style}>
          {cards}
        </div>
      );
    },
    [handleSelectItem, items]
  );

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setPosMenuAnchorEl(event.currentTarget);
  };

  return (
    <>
      <div className="w-full h-full flex">
        <div className="grow min-w-[800px] flex flex-col">
          <div className="w-full h-[50px]">
            <Chip
              label="Category"
              icon={<ExpandMoreIcon />}
              color="secondary"
              variant="outlined"
              onClick={handleFilterClick}
              className="shadow-md border"
            />
          </div>
          <div className="grow">
            <AutoSizer>
              {({ height, width }) => {
                const cardsPerRow = Math.floor(width / CARD_WIDTH) || 1;
                const rowCount = Math.ceil(items.length / cardsPerRow);

                return (
                  <div>
                    <List
                      width={width}
                      height={height}
                      rowCount={rowCount}
                      rowHeight={CARD_HEIGHT}
                      rowRenderer={(params) =>
                        rowRenderer({ ...params, cardsPerRow })
                      }
                    />
                  </div>
                );
              }}
            </AutoSizer>
          </div>
        </div>
        <div className="w-[450px] h-full p-3">
          <div
            className="w-full h-full rounded-md border p-3 shadow-lg flex flex-col overflow-auto"
            style={{ backgroundColor: 'var(--bg-color)' }}
          >
            <div className="grow overflow-auto flex flex-col gap-2">
              <b style={{ color: 'white' }}>ORDERS</b>
              <div className="flex flex-col h-fit gap-2">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="w-full h-[80px] shadow-md rounded-md flex flex-row overflow-hidden"
                    style={{ backgroundColor: 'white' }}
                  >
                    <div className="min-w-[80px] w-[80px] h-full">
                      <img
                        src={item.image?.url}
                        alt={item.image?.name}
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center',
                          width: '80px',
                          height: '80px',
                        }}
                      />
                    </div>
                    <div className="shrink min-w-[100px] p-2 capitalize">
                      <b>{item.name}</b>
                      <br />
                      <NumericFormat
                        className="mb-2 px-1 bg-transparent"
                        value={item.selling_price}
                        prefix="₱ "
                        thousandSeparator
                        valueIsNumericString
                        disabled
                      />
                    </div>
                    <div className="min-w-[100px] w-[100px] max-w-fit h-[80px] flex flex-row justify-center items-center">
                      <IconButton
                        disabled={orders[item.id] <= 0}
                        onClick={() =>
                          handleIterateOrderQuantity('minus', item.id)
                        }
                      >
                        <ChevronLeftIcon />
                      </IconButton>
                      <input
                        className="input-number-hidden-buttons bg-transparent min-w-[30px] w-fit text-center"
                        value={orders[item.id]}
                        max={item.stock_quantity}
                        min={0}
                        type="number"
                        onChange={(e) =>
                          setOrders((userOrders) => ({
                            ...userOrders,
                            [item.id]: Number(e.target.value),
                          }))
                        }
                      />
                      <IconButton
                        disabled={orders[item.id] >= item.stock_quantity}
                        onClick={() =>
                          handleIterateOrderQuantity('add', item.id)
                        }
                      >
                        <ChevronRightIcon />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full h-[350px] flex flex-col text-white">
              <br />
              <b style={{ color: 'white' }}>BILL</b>
              <div className="flex flex-row justify-between">
                <p>Sub-total:</p>
                <div>
                  <NumericFormat
                    className="mb-2 px-1 bg-transparent grow text-end"
                    value={subTotal}
                    prefix="₱ "
                    thousandSeparator
                    valueIsNumericString
                    disabled
                  />
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <p>{`Tax ${tax ? `${computedTax}%` : ''} (VAT included):`}</p>
                <div>
                  <NumericFormat
                    className="mb-2 px-1 bg-transparent grow text-end"
                    value={tax}
                    prefix="₱ "
                    thousandSeparator
                    valueIsNumericString
                    disabled
                  />
                </div>
              </div>
              <br />
              <div className="grow w-full border-dashed border-t-4 py-3 flex flex-col justify-between">
                <div className="flex flex-row justify-between">
                  <p>Total:</p>
                  <div>
                    <NumericFormat
                      className="mb-2 px-1 bg-transparent grow text-end"
                      value={total}
                      prefix="₱ "
                      thousandSeparator
                      valueIsNumericString
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-row justify-between">
                  <div>
                    <p>Payment Method:</p>
                    <div className="flex flex-row justify-start items-center">
                      <p className="text-sm text-gray-600">Cash</p>
                      <PaymentUISwitch
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                      />
                      <p className="text-sm text-gray-600">Card</p>
                    </div>
                  </div>
                  <div>
                    <p>{selectedPaymentMethod}</p>
                  </div>
                </div>
                <Button
                  fullWidth
                  variant="contained"
                  color="inherit"
                  sx={{ color: 'black' }}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <POSMenu
        list={categories}
        anchorEl={posMenuAnchorEl}
        open={Boolean(posMenuAnchorEl)}
        onChange={(ids) => setCategoryIds(ids as Array<number>)}
        onClose={() => setPosMenuAnchorEl(null)}
      />
    </>
  );
}
