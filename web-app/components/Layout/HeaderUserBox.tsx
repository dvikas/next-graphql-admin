import React, { Fragment, useContext } from 'react';
import clsx from 'clsx';
import { useMutation, useApolloClient } from '@apollo/react-hooks';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import {
  Avatar,
  Box,
  Menu,
  Button,
  List,
  ListItem,
  Divider
} from '@material-ui/core';
import { fade, makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import Typography from '@material-ui/core/Typography';
import { currentUserQuery } from '../../graphql/queries/index';
import { useQuery } from '@apollo/react-hooks';
// import { AuthContext } from '../../../context/auth';
import { logoutMutation } from '../../graphql/mutations';
import { LogoutMutation } from '../../graphql/generated/LogoutMutation';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawerOpen: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    inline: {
      display: 'inline',
    },
    mt2: {
      marginTop: '20px'
    },
    px2: {
      paddingLeft: '10px',
      paddingRight: '10px'
    },
    pt2: {
      paddingTop: '20px'
    },
    w100: {
      fontWeight: 'lighter'
    },
    w500: {
      fontWeight: 'bold'
    },
    textCenter: {
      textAlign: 'center'
    },
    lineHeight1: {
      lineHeight: 1
    },
    userRole: {
      color: theme.palette.grey[300]
    }
  }));

export default function HeaderUserbox() {
  const client = useApolloClient();
  const [logout, { loading: logoutLoading }] = useMutation<LogoutMutation>(logoutMutation, {
    onCompleted: () => client.resetStore(),
  });
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const classes = useStyles();

  const { data, error, loading } = useQuery(currentUserQuery);

  if (logoutLoading) return <></>;
  if (loading) return <></>;
  if (error) return <></>;
  const { me } = data

  return (
    <Fragment>
      <Button
        color="inherit"
        onClick={handleClick}
        className="">
        <ListItem alignItems="flex-start" style={{ padding: '0 10px' }}>
          <ListItemAvatar>
            <Avatar alt="Travis Howard" src="/images/user.jpg" />
          </ListItemAvatar>
          <ListItemText
            style={{ textTransform: 'capitalize' }}
            primary={me.name}
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  className={clsx(classes.inline, classes.userRole)}
                >
                  Super Admin
              </Typography>
              </React.Fragment>
            }
          />
        </ListItem>
        {/* <Box>
          <Avatar sizes="44" alt="Emma Taylor" src="/images/user.jpg" />
        </Box>
        <div className="d-xl-block pl-3">
          <div className="font-weight-bold pt-2 line-height-1">Vikas</div>
          <span className="text-white-50">Super Admin</span>
        </div> */}

        <span className="pl-1 pl-xl-3">
          <FontAwesomeIcon icon={faAngleDown} className="opacity-5" />
        </span>
      </Button>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        getContentAnchorEl={null}
        open={Boolean(anchorEl)}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center'
        }}
        onClose={handleClose}>
        <div className={classes.px2}>
          <List >
            <Box component="div" color="text.primary" className={classes.textCenter}>
              <Avatar sizes="44" alt="Emma Taylor" src="/images/user.jpg" style={{ margin: '0 auto' }} />
            </Box>
            <div className="pl-3  pr-3">
              <div className={clsx(classes.w500, classes.pt2, classes.textCenter, classes.lineHeight1)}>
                {me.name}
              </div>
              <div className={classes.textCenter}>
                Super Admin
              </div>
            </div>
            <Divider className={clsx(classes.mt2, classes.w100)} />
            <ListItem button>My Account</ListItem>
            <ListItem button>Profile settings</ListItem>
            <ListItem button>Active tasks</ListItem>
            <Divider className="w-100" />
            <ListItem className="d-block1 rounded-bottom1 px-3 pt-3 pb-0 text-left">
              <Button
                onClick={() => {
                  logout();
                }}
                fullWidth={true}
                startIcon={<FontAwesomeIcon style={{ fontSize: '12px' }} icon={faSignOutAlt} />}
                color="secondary">Logout</Button>
            </ListItem>
          </List>
        </div>
      </Menu>
    </Fragment >
  );
}