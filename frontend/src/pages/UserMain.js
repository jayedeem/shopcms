import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Loading, Row, SearchBar } from '../components'
import { useQuery } from 'react-query'

import { atom, useRecoilState } from 'recoil'

import AuthService from '../services/auth.service'
import UserServices from '../services/user.service'

const userListState = atom({
  key: 'userlist',
  default: []
})

const searchQuery = atom({
  key: 'searchquery',
  default: ''
})

export const UsersPage = () => {
  const history = useHistory()
  // const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  const [didMount, setDidMount] = useState(false)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState()
  const [userList, setUserList] = useRecoilState(userListState)
  const [searchValue, setSearchValue] = useRecoilState(searchQuery)

  const classes = useStyles()

  const handleChangePage = (e, newPage) => {
    setPage(newPage)
  }

  const handleChangePerRow = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  useEffect(() => {
    const user = AuthService.getCurrentUser()
    if (!user) {
      return history.push('/login')
    }
  }, [history])

  const retrieveUsers = useCallback(async () => {
    const { data } = await UserServices.getUsers()
    setStatus(data.status.msg)
    const filtered = data.api.userApi
      .filter(
        (user) => user.state !== 'disabled' && user.email.match(/^.+@ultra.me$/)
      )
      // .filter((user) => user.first_name.toLowerCase() === 'test')
      .sort((a, b) => (a.first_name < b.first_name ? -1 : 1))
    setCount(filtered.length)
    setUserList(filtered)

    return filtered
  }, [setUserList])

  const { data: userData, isLoading, error, isFetching } = useQuery(
    'userlist',
    retrieveUsers,
    {
      refetchOnWindowFocus: false
    }
  )

  if (isLoading || isFetching) {
    return <Loading />
  }

  if (error) {
    return <p>Something went wrong</p>
  }

  const handleQuery = (e) => {
    setPage(0)
    setStatus('Querying')
    setSearchValue(e.target.value)
    setCount(array.length)
  }

  let array = []

  return (
    <>
      <div className={classes.text}>
        <SearchBar handleQuery={handleQuery} />
      </div>

      <div className={classes.container}>
        <Table
          size="small"
          aria-label="a dense table"
          className={classes.table}
        >
          <TableHead
          // className={classes.container}
          >
            <TableRow>
              <TableCell>Shopify ID</TableCell>
              <TableCell align="left">First Name</TableCell>
              <TableCell align="left">Last Name</TableCell>
              <TableCell align="left">email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userData
              .filter((value) => {
                if (searchValue === '') {
                  return value
                } else if (
                  value.first_name
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                  value.last_name
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                  value.email.toLowerCase().includes(searchValue.toLowerCase())
                ) {
                  array.push(value)

                  return value
                } else {
                  return null
                }
              })
              .map((user) => <Row key={user.id} user={user} />)
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
          </TableBody>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={count}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangePerRow}
          />
        </Table>
      </div>
    </>
  )
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    width: '100%',
    marginTop: '20px'

    // alignContent: 'space-around'
    // alignItems: 'center',
    // justifyContent: 'center'
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    // width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    marginTop: '100px'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    width: '100%',
    marginTop: '20px'
  }
})