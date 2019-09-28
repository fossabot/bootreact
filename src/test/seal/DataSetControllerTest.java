package seal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@ContextConfiguration(classes = {DataSetController.class})
@WebMvcTest
public class DataSetControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private DataSetRepository service;

//    todo: sorting, pagination, ...

    @Test
    public void givenDataSets_whenFindAllDataSets_thenReturnJsonArray() throws Exception {

        DataSet validDataSet = new DataSet("Frodo Baggins", 33, "Testicle Cancer");

        List<DataSet> allDataSets = Arrays.asList(validDataSet);

        given(service.findAll()).willReturn(allDataSets);

        mvc.perform(get("/api/dataSets")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is(validDataSet.getName())));
    }
}
