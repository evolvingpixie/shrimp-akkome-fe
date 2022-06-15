const ListCard = {
  props: [
    'list'
  ],
  methods: {
    listLink (id) {
      return '/lists/' + id
    }
  }
}

export default ListCard
