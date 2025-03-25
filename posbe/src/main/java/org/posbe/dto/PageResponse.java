package org.posbe.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Builder
@Setter
public class PageResponse<T> implements Serializable {
    private int page;
    private int size;
    private long total;
    private T items;


}
